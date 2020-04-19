import { GlobalTurnSnapshot, IndexGenerator, TURN_DELAY } from "@timeflies/shared";
import { Character } from "../../entities/character/Character";
import { Turn } from "./Turn";

export type GlobalTurnState = 'idle' | 'running';

export interface GlobalTurn {
    readonly id: number;
    readonly startTime: number;
    readonly charactersOrdered: readonly Character[];
    readonly state: GlobalTurnState;
    readonly currentTurn: Turn;
    notifyDeaths(): void;
    stop(): void;
    toSnapshot(): GlobalTurnSnapshot;
}

export const GlobalTurn = (
    id: number, startTime: number, charactersOrdered: readonly Character[],
    generateTurnId: IndexGenerator,
    onGlobalTurnEnd: (endTime: number) => void, onTurnStart: () => void
) => {

    charactersOrdered = [ ...charactersOrdered ];

    let currentTurn: Turn;

    const turnId = generateTurnId.next().value;

    const setCurrentTurn = (turn: Turn) => {
        if (currentTurn)
            currentTurn.clearTimedActions();

        currentTurn = turn;
        turn.refreshTimedActions();
    };

    const notifyDeaths = (): void => {
        if (!currentTurn.character.isAlive) {
            onTurnEnd();
        }
    };

    const onTurnEnd = (): void => {
        currentTurn.clearTimedActions();

        const currentCharacterIndex = getCurrentCharacterIndex();

        runNextTurn(currentCharacterIndex + 1);
    };

    const runNextTurn = (nextCharacterIndex: number): void => {

        if (nextCharacterIndex >= charactersOrdered.length) {
            onGlobalTurnEnd(currentTurn.endTime);
        }
        else {
            const currentCharacter = charactersOrdered[ nextCharacterIndex ];
            if (currentCharacter.isAlive) {
                console.log(`Wait ${TURN_DELAY}ms`);
                const turnId = generateTurnId.next().value;
                setCurrentTurn(Turn(turnId, currentTurn.endTime + TURN_DELAY, currentCharacter, onTurnStart, onTurnEnd));
            } else {
                runNextTurn(nextCharacterIndex + 1);
            }
        }
    };

    const getCurrentCharacterIndex = (): number => {
        return charactersOrdered.findIndex(c => c.id === currentTurn.character.id);
    };

    const toSnapshot = (): GlobalTurnSnapshot => {
        return {
            id,
            startTime,
            order: charactersOrdered.map(c => c.staticData.id),
            currentTurn: currentTurn.toSnapshot()
        };
    };

    const stop = (): void => {
        currentTurn.clearTimedActions();
    };

    setCurrentTurn(Turn(turnId, startTime, charactersOrdered[ 0 ], () => null, onTurnEnd));

    const this_: GlobalTurn = {
        id,
        startTime,
        charactersOrdered,
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
