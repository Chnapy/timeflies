import { GlobalTurnSnapshot, IndexGenerator, TURN_DELAY, characterIsAlive, denormalize } from "@timeflies/shared";
import { EntitiesGetter } from '../../battleStateManager/BattleStateManager';
import { Turn } from "./Turn";

export type GlobalTurnState = 'idle' | 'running';

export interface GlobalTurn {
    readonly id: number;
    readonly startTime: number;
    // readonly charactersOrdered: readonly Character[];
    readonly state: GlobalTurnState;
    readonly currentTurn: Turn;
    notifyDeaths(): void;
    stop(): void;
    toSnapshot(): GlobalTurnSnapshot;
}

export const GlobalTurn = (
    id: number, startTime: number, get: EntitiesGetter<'characters'>,
    generateTurnId: IndexGenerator,
    onGlobalTurnEnd: (endTime: number) => void, onTurnStart: () => void
) => {

    const getCharacters = () => get('characters');

    const order = denormalize(getCharacters()).map(c => c.id);

    let currentTurn: Turn;

    const turnId = generateTurnId.next().value;

    const setCurrentTurn = (turn: Turn) => {
        if (currentTurn)
            currentTurn.clearTimedActions();

        currentTurn = turn;
        turn.refreshTimedActions();
    };

    const notifyDeaths = (): void => {
        if (!characterIsAlive(currentTurn.getCharacter())) {
            onTurnEnd();
        }
    };

    const onTurnEnd = (): void => {
        currentTurn.clearTimedActions();

        const currentCharacterIndex = getCurrentCharacterIndex();

        runNextTurn(currentCharacterIndex + 1);
    };

    const runNextTurn = (nextCharacterIndex: number): void => {

        if (nextCharacterIndex >= order.length) {
            onGlobalTurnEnd(currentTurn.endTime);
        }
        else {
            const getCurrentCharacter = () => getCharacters()[ order[ nextCharacterIndex ] ];

            if (characterIsAlive(getCurrentCharacter())) {
                console.log(`Wait ${TURN_DELAY}ms`);
                const turnId = generateTurnId.next().value;
                setCurrentTurn(Turn(turnId, currentTurn.endTime + TURN_DELAY, getCurrentCharacter, onTurnStart, onTurnEnd));
            } else {
                runNextTurn(nextCharacterIndex + 1);
            }
        }
    };

    const getCurrentCharacterIndex = (): number => {
        return order.findIndex(id => id === currentTurn.getCharacter().id);
    };

    const toSnapshot = (): GlobalTurnSnapshot => {
        return {
            id,
            startTime,
            order: [ ...order ],
            currentTurn: currentTurn.toSnapshot()
        };
    };

    const stop = (): void => {
        currentTurn.clearTimedActions();
    };

    setCurrentTurn(Turn(turnId, startTime, () => getCharacters()[ order[0] ], () => null, onTurnEnd));

    const this_: GlobalTurn = {
        id,
        startTime,
        // charactersOrdered,
        get state(): GlobalTurnState {
            const now = Date.now();
            if (now >= startTime) {
                return 'running';
            }
            return 'idle';
        },
        get currentTurn(): Turn {
            return currentTurn;
        },
        notifyDeaths,
        stop,
        toSnapshot
    };

    return this_;
};
