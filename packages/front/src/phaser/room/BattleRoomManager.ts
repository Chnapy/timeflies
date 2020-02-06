import { BRunGlobalTurnStartSAction, BRunTurnStartSAction, ClientAction, ConfirmSAction, NotifySAction } from '@timeflies/shared';
import { Controller } from '../../Controller';
import { BattleRollbackAction, BattleSpellLaunchAction } from '../battleReducers/BattleReducerManager';
import { BattleScene, BattleSceneData } from '../scenes/BattleScene';


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

        Controller.client.send<S>(message);

        return promise;
    }

    private setupOnMessage(): void {

        Controller.client.on<BRunGlobalTurnStartSAction>('battle-run/global-turn-start', this.onGlobalTurnStart);

        Controller.client.on<BRunTurnStartSAction>('battle-run/turn-start', this.onTurnStart);

        Controller.client.on<ConfirmSAction>('confirm', this.onConfirm);

        Controller.client.on<NotifySAction>('notify', this.onNotify);
    };

    private readonly onGlobalTurnStart = (action: BRunGlobalTurnStartSAction): void => {
        const {cycle} = this.scene;
        
        cycle.synchronizeGlobalTurn(action.globalTurnState);
    };

    private readonly onTurnStart = (action: BRunTurnStartSAction): void => {
        const {cycle} = this.scene;
        
        cycle.synchronizeTurn(action.turnState);
    };

    private readonly onConfirm = (receive: ConfirmSAction): void => {
        const { sendTime, isOk } = receive;
        // TODO check time, may be wrong
        while (this.sendStack.length && this.sendStack[this.sendStack.length - 1].time >= sendTime) {

            const send = this.sendStack.pop()!;

            if (isOk) {
                send.resolvePromise(receive);
            } else {
                send.rejectPromise(receive);
            }
        }
    };

    private readonly onNotify = (receive: NotifySAction): void => {
        const { startTime, charAction } = receive;

        const spell = this.state.battleData.globalTurn?.currentTurn.currentCharacter.spells
            .find(s => s.id === charAction.spellId);

        if (!spell) {
            console.error(
                'notify spell issue',
                charAction.spellId,
                this.state.battleData.globalTurn?.currentTurn?.currentCharacter.spells.map(s => s.id)
            );
            return;
        }

        Controller.dispatch<BattleSpellLaunchAction>({
            type: 'battle/spell/launch',
            charAction: {
                positions: charAction.positions,
                state: 'running',
                spell,
                startTime,
                duration: spell.feature.duration
            }
        });
    };

    // static mockResponse<R extends ServerAction>(delay: number, data: Omit<R, 'time'>, time?: number | 'last'): void {
    //     setTimeout(() => {
    //         time = time === 'last' ? mockRoom.sendStack[ mockRoom.sendStack.length - 1 ].time : time;
    //         mockRoom.room.mockResponse(0, data, time);
    //     }, delay);
    // }
}