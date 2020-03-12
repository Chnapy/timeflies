import { assertIsDefined, assertThenGet, BRunGlobalTurnStartSAction, BRunTurnStartSAction, getIndexGenerator, GlobalTurnSnapshot, TurnSnapshot } from '@timeflies/shared';
import { BattleData } from "../../../BattleData";
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
}

interface Dependencies {
    globalTurnCreator: typeof GlobalTurn;
}

export const CycleManager = (
    battleData: Pick<BattleData, 'globalTurn' | 'characters'>,
    { globalTurnCreator }: Dependencies = { globalTurnCreator: GlobalTurn }
): CycleManager => {

    const { characters } = battleData;

    const waitingSnapshots: GlobalTurnSnapshot[] = [];

    const globalTurnIdGenerator = getIndexGenerator();

    const onGlobalTurnEnd = (): void => {
        delete battleData.globalTurn;

        const snapshot = waitingSnapshots.pop();
        if (snapshot)
            battleData.globalTurn = globalTurnCreator(snapshot, characters, globalTurnIdGenerator, onGlobalTurnEnd);
    };

    const synchronizeGlobalTurn = (globalTurnSnapshot: GlobalTurnSnapshot): void => {

        if (battleData.globalTurn?.id === globalTurnSnapshot.id) {
            battleData.globalTurn.synchronize(globalTurnSnapshot);
        } else {
            waitingSnapshots.push(globalTurnSnapshot);

            if (!battleData.globalTurn) {
                onGlobalTurnEnd();
            }
        }
    };

    const synchronizeTurn = (turnSnapshot: TurnSnapshot): void => {
        const globalTurn = assertThenGet(battleData.globalTurn, assertIsDefined);

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
            return battleData.globalTurn?.currentTurn.state === 'running';
        },
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