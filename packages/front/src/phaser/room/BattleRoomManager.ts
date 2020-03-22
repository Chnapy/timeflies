import { BRunGlobalTurnStartSAction, BRunTurnStartSAction, ClientAction, ConfirmSAction, NotifySAction } from '@timeflies/shared';
import { Controller } from '../../Controller';
import { BattleScene, BattleSceneData } from '../../stages/battle/BattleScene';

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

// let mockRoom: BattleRoomManager;
export class BattleRoomManager {

    private readonly scene: BattleScene;

    private _state: BattleSceneData;
    get state(): BattleSceneData {
        return this._state;
    }

    private readonly sendStack: SendTimed<any>[];

    constructor(scene: BattleScene, state: BattleSceneData) {
        this.scene = scene;
        this._state = state;
        this.sendStack = [];
        this.setupOnMessage();
        // mockRoom = this;
    }

    readonly send = <S extends ClientAction>(partialMessage: Omit<S, 'sendTime'>, _sendTime?: number): SendPromise<S> => {
        const sendTime = _sendTime || Date.now();

        const message: S = {
            ...partialMessage,
            sendTime
        } as S;

        const getOnReject = (reject: Function) => (reason) => {

//@ts-ignore
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

//@ts-ignore
        Controller.client.send<S>(message);

        return promise;
    }

    private setupOnMessage(): void {
    };

    // static mockResponse<R extends ServerAction>(delay: number, data: Omit<R, 'time'>, time?: number | 'last'): void {
    //     setTimeout(() => {
    //         time = time === 'last' ? mockRoom.sendStack[ mockRoom.sendStack.length - 1 ].time : time;
    //         mockRoom.room.mockResponse(0, data, time);
    //     }, delay);
    // }
}