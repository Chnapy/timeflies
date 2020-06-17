import { BRunGlobalTurnStartSAction, BRunTurnStartSAction, getIndexGenerator, GLOBALTURN_DELAY, IndexGenerator } from "@timeflies/shared";
import { EntitiesGetter } from '../battleStateManager/BattleStateManager';
import { GlobalTurn } from "./turn/GlobalTurn";

export interface Cycle {
    readonly globalTurn: GlobalTurn;
    start(launchTime: number): void;
    stop(): void;
}

export const Cycle = (get: EntitiesGetter<'players' | 'characters'>): Cycle => {

    const generateGlobalTurnId: IndexGenerator = getIndexGenerator();
    const generateTurnId: IndexGenerator = getIndexGenerator();

    let globalTurn: GlobalTurn;

    const newGlobalTurn = (startTime: number, send: boolean = true): GlobalTurn => {

        const globalTurnId = generateGlobalTurnId.next().value;
        const globalTurn = GlobalTurn(
            globalTurnId, startTime,
            get, generateTurnId,
            onGlobalTurnEnd, onTurnStart
        );

        if (send) {
            const snapshot = globalTurn.toSnapshot();
            get('players').forEach(p => {
                p.socket.send<BRunGlobalTurnStartSAction>({
                    type: 'battle-run/global-turn-start',
                    globalTurnState: snapshot
                });
            });
        }

        return globalTurn;
    };

    const onTurnStart = (): void => {

        const snapshot = globalTurn.currentTurn.toSnapshot();
        get('players').forEach(p => {
            p.socket.send<BRunTurnStartSAction>({
                type: 'battle-run/turn-start',
                turnState: snapshot
            });
        });
    };

    const onGlobalTurnEnd = (): void => {
        console.log('C-GT-ONEND', globalTurn.currentTurn.endTime);
        console.log(`Wait ${GLOBALTURN_DELAY}ms`);
        globalTurn = newGlobalTurn(globalTurn.currentTurn.endTime + GLOBALTURN_DELAY);
    };

    return {
        get globalTurn() {
            return globalTurn;
        },
        start(launchTime: number) {
            globalTurn = newGlobalTurn(launchTime, false);
        },
        stop() {
            globalTurn.stop();
        }
    }
};
