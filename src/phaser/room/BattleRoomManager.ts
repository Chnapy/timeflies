import { Controller } from '../../Controller';
import { Room } from '../../mocks/MockColyseus';
import { BattleRollbackAction, BattleStartAction } from '../battleReducers/BattleReducerManager';
import { BattleRoomState } from '../scenes/BattleScene';
import { CharAction } from '../cycle/CycleManager';

interface Message<T extends string> {
    time: number;
    type: T;
}

export interface StartReceive extends Message<'start'> {
}

export interface CharActionSend extends Message<'charAction'> {
    charAction: CharAction;
}

export interface ConfirmReceive extends Message<'confirm'> {
    isOk: boolean;
}

type Send =
    | CharActionSend;

type Receive =
    | StartReceive
    | ConfirmReceive;

export interface SendPromise<S extends Send> extends Promise<{
    send: S;
    receive: ConfirmReceive;
}> { }

interface SendTimed<S extends Send> {
    time: number;
    message: S;
    promise: SendPromise<S>;
    resolvePromise: (receive: ConfirmReceive) => void;
    rejectPromise: (receive: ConfirmReceive) => void;
}

let mockRoom: BattleRoomManager;
export class BattleRoomManager {
    private readonly room: Room<BattleRoomState>;

    private readonly sendStack: SendTimed<any>[];

    get state(): BattleRoomState {
        return this.room.state;
    }

    constructor(room: Room<BattleRoomState>) {
        this.room = room;
        this.sendStack = [];
        room.onMessage(this.onMessage);
        mockRoom = this;
    }

    readonly send = <S extends Send>(partialMessage: Omit<S, 'time'>, _time?: number): SendPromise<S> => {
        const time = _time || Date.now();

        const message: S = {
            ...partialMessage,
            time
        } as any;

        const getOnReject = (reject: Function) => (reason) => {

            Controller.dispatch<BattleRollbackAction>({
                type: 'battle/rollback',
                config: {
                    by: 'time',
                    time
                }
            });

            return reject(reason);
        };

        let resolvePromise, rejectPromise;
        const promise: SendPromise<S> = new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = getOnReject(reject);
        });

        const sendTimed: SendTimed<S> = {
            time,
            message,
            promise,
            resolvePromise,
            rejectPromise
        };

        this.sendStack.push(sendTimed);

        this.room.send(message);

        return promise;
    }

    private readonly onMessage = (message: Receive): void => {
        console.log('MESSAGE', message);

        switch (message.type) {
            case 'start':
                Controller.dispatch<BattleStartAction>({
                    type: 'battle/start'
                });
                return;
            case 'confirm':
                this.onConfirm(message);
                return;
        }
    };

    private readonly onConfirm = (receive: ConfirmReceive): void => {
        const { time, isOk } = receive;

        while (this.sendStack.length && this.sendStack[ this.sendStack.length - 1 ].time >= time) {

            const send = this.sendStack.pop()!;

            if (isOk) {
                send.resolvePromise(receive);
            } else {
                send.rejectPromise(receive);
            }
        }
    }

    static mockResponse<R extends Receive>(delay: number, data: Omit<R, 'time'>, time?: number | 'last'): void {
        setTimeout(() => {
            time = time === 'last' ? mockRoom.sendStack[ mockRoom.sendStack.length - 1 ].time : time;
            mockRoom.room.mockResponse(0, data, time);
        }, delay);
    }
}