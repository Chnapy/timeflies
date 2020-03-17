import { assertIsDefined, assertThenGet, BRunGlobalTurnStartSAction, BRunTurnStartSAction, getIndexGenerator, GlobalTurnSnapshot, TurnSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { GlobalTurn } from './GlobalTurn';

//TODO handle state
// export type CharActionState = 'running' | 'complete' | 'canceled';

// export type CharAction<S extends CharActionState = CharActionState> = {
//     state: S;
//     spell: Spell;
//     positions: Position[];
//     startTime: number;
//     duration: number;
// } & (S extends 'canceled'
//     ? {
//         cancelTime: number;
//     }
//     : {});

export interface CycleManager {
    readonly isRunning: boolean;
    start(globalTurnSnap: GlobalTurnSnapshot): void;
}

interface Dependencies {
    globalTurnCreator: typeof GlobalTurn;
}

export const CycleManager = (
    { globalTurnCreator }: Dependencies = { globalTurnCreator: GlobalTurn }
): CycleManager => {

    const cycleData = serviceBattleData('cycle');

    const battleData = serviceBattleData('current');

    const { characters } = battleData;

    const waitingSnapshots: GlobalTurnSnapshot[] = [];

    const globalTurnIdGenerator = getIndexGenerator();

    const onGlobalTurnEnd = (): void => {

        const snapshot = waitingSnapshots.pop();
        if (snapshot) {
            delete cycleData.globalTurn;
            cycleData.globalTurn = globalTurnCreator(snapshot, characters, globalTurnIdGenerator, onGlobalTurnEnd);
            cycleData.globalTurn.start();
        }
    };

    const synchronizeGlobalTurn = (globalTurnSnapshot: GlobalTurnSnapshot): void => {

        if (cycleData.globalTurn?.id === globalTurnSnapshot.id) {
            cycleData.globalTurn.synchronize(globalTurnSnapshot);
        } else {
            waitingSnapshots.push(globalTurnSnapshot);

            if (!cycleData.globalTurn) {
                onGlobalTurnEnd();
            }
        }
    };

    const synchronizeTurn = (turnSnapshot: TurnSnapshot): void => {
        const globalTurn = assertThenGet(cycleData.globalTurn, assertIsDefined);

        globalTurn.synchronizeTurn(turnSnapshot);
    };

    const { onMessageAction } = serviceEvent();

    onMessageAction<BRunGlobalTurnStartSAction>(
        'battle-run/global-turn-start',
        ({ globalTurnState }) => synchronizeGlobalTurn(globalTurnState)
    );

    onMessageAction<BRunTurnStartSAction>(
        'battle-run/turn-start',
        ({ turnState }) => synchronizeTurn(turnState)
    );

    return {
        get isRunning(): boolean {
            return cycleData.globalTurn?.currentTurn.state === 'running';
        },
        start(globalTurnSnap) {
            synchronizeGlobalTurn(globalTurnSnap);
        }
    };
};

// export class CycleManager2 {

//     private readonly room: BattleRoomManager;
//     private readonly dataStateManager: DataStateManager;
//     private readonly battleData: BattleData;

//     private readonly globalTurnIdGenerator: IndexGenerator;

//     readonly players: readonly Player[];
//     readonly characters: readonly Character[];

//     get isRunning(): boolean {
//         return this.battleData.globalTurn?.currentTurn.state === 'running';
//     }

//     // private get charActionStack(): CharAction[] {
//     //     return this.battleData.globalTurn?.currentTurn.charActionStack || [];
//     // }

//     private waitingSnapshots: GlobalTurnSnapshot[];

//     constructor(room: BattleRoomManager, dataStateManager: DataStateManager, battleData: BattleData) {
//         this.room = room;
//         this.dataStateManager = dataStateManager;
//         this.battleData = battleData;
//         this.players = battleData.players;
//         this.characters = battleData.characters;
//         this.waitingSnapshots = [];
//         this.globalTurnIdGenerator = getIndexGenerator();
//     }

//     // addCharActionAndSend(charAction: CharAction): SendPromise<CharActionCAction> {

//     //     this.addCharAction(charAction);

//     //     return this.room.send<CharActionCAction>({
//     //         type: 'charAction',
//     //         charAction: {
//     //             spellId: charAction.spell.id,
//     //             positions: charAction.positions
//     //         }
//     //     }, charAction.startTime);
//     // }

//     // addCharAction(charAction: CharAction): void {

//     //     this.dataStateManager.commit(charAction.startTime);

//     //     this.charActionStack.push(charAction);
//     // }

//     // cancelCharActionByTime(startTime: number, cancelTime: number): void {
//     //     const charAction = this.charActionStack.find(ca => ca.startTime === startTime);

//     //     if (charAction) {
//     //         charAction.state = 'canceled';
//     //         (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
//     //     }
//     // }

//     // cancelCharActionLast(cancelTime: number): void {
//     //     const charAction = this.charActionStack[this.charActionStack.length - 1];

//     //     if (charAction) {
//     //         charAction.state = 'canceled';
//     //         (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
//     //     }
//     // }

//     synchronizeGlobalTurn(globalTurnSnapshot: GlobalTurnSnapshot): void {

//         if (this.battleData.globalTurn?.id === globalTurnSnapshot.id) {
//             this.battleData.globalTurn.synchronize(globalTurnSnapshot);
//         } else {
//             this.waitingSnapshots.push(globalTurnSnapshot);

//             if (!this.battleData.globalTurn) {
//                 this.onGlobalTurnEnd();
//             }
//         }
//     }

//     synchronizeTurn(turnSnapshot: TurnSnapshot): void {
//         const globalTurn = this.battleData.globalTurn!;

//         globalTurn.synchronizeTurn(turnSnapshot);
//     }

//     private onGlobalTurnEnd = (): void => {
//         delete this.battleData.globalTurn;

//         const snapshot = this.waitingSnapshots.pop();
//         if (snapshot)
//             this.battleData.globalTurn = GlobalTurn(snapshot, this.characters, this.globalTurnIdGenerator, this.onGlobalTurnEnd);
//     };
// }