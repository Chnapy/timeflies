import { assertIsDefined, assertThenGet, BRunGlobalTurnStartSAction, BRunTurnStartSAction, getIndexGenerator, GlobalTurnSnapshot, TurnSnapshot } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { GlobalTurn } from './GlobalTurn';

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
