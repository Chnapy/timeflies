import { ConfirmSAction } from '@shared/action/BattleRunAction';
import { ClientAction, ServerAction } from '@shared/action/TAction';
import { Room } from 'colyseus.js';
import { Controller } from '../../Controller';
import { BattleRollbackAction, BattleStartAction } from '../battleReducers/BattleReducerManager';
import { BattleRoomState } from '../scenes/BattleScene';


export interface SendPromise<S extends ClientAction> extends Promise<{
    send: S;
    receive: ConfirmSAction;
}> { }

interface SendTimed<S extends ClientAction> {
    time: number;
    message: S;
    promise: SendPromise<S>;
    resolvePromise: (receive: ConfirmSAction) => void;
    rejectPromise: (receive: ConfirmSAction) => void;
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

    readonly send = <S extends ClientAction>(partialMessage: Omit<S, 'sendTime'>, _sendTime?: number): SendPromise<S> => {
        const sendTime = _sendTime || Date.now();

        const message: S = {
            ...partialMessage,
            sendTime
        } as any;

        const getOnReject = (reject: Function) => (reason) => {

            Controller.dispatch<BattleRollbackAction>({
                type: 'battle/rollback',
                config: {
                    by: 'time',
                    time: sendTime
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
            time: sendTime,
            message,
            promise,
            resolvePromise,
            rejectPromise
        };

        this.sendStack.push(sendTimed);

        this.room.send(message);

        return promise;
    }

    private readonly onMessage = (message: ServerAction): void => {

        switch (message.type) {
            case 'battle-run/launch':
                Controller.dispatch<BattleStartAction>({
                    type: 'battle/start'
                });
                return;
            case 'confirm':
                this.onConfirm(message);
                return;
        }
    };

    private readonly onConfirm = (receive: ConfirmSAction): void => {
        const { sendTime, isOk } = receive;
        // TODO check time, may be wrong
        while (this.sendStack.length && this.sendStack[ this.sendStack.length - 1 ].time >= sendTime) {

            const send = this.sendStack.pop()!;

            if (isOk) {
                send.resolvePromise(receive);
            } else {
                send.rejectPromise(receive);
            }
        }
    }

    static mockResponse<R extends ServerAction>(delay: number, data: Omit<R, 'time'>, time?: number | 'last'): void {
        // setTimeout(() => {
        //     time = time === 'last' ? mockRoom.sendStack[ mockRoom.sendStack.length - 1 ].time : time;
        //     mockRoom.room.mockResponse(0, data, time);
        // }, delay);
    }
}