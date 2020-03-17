import { assertIsDefined, assertThenGet, GlobalTurnSnapshot, IndexGenerator, TurnSnapshot, TURN_DELAY } from "@timeflies/shared";
import { Character } from "../entities/Character";
import { Turn } from "./Turn";

export type GlobalTurnState = 'idle' | 'running';

export interface GlobalTurn {
    readonly id: number;
    readonly state: GlobalTurnState;
    readonly currentTurn: Turn;
    start(): void;
    notifyDeaths(): void;
    synchronize(snapshot: GlobalTurnSnapshot): void;
    synchronizeTurn(turnSnapshot: TurnSnapshot): void;
}

interface Dependencies {
    turnCreator: typeof Turn;
}

export const GlobalTurn = (
    snapshot: GlobalTurnSnapshot, characters: readonly Character[], generateTurnId: IndexGenerator, onGlobalTurnEnd: (endTime: number) => void,
    { turnCreator }: Dependencies = { turnCreator: Turn }
): GlobalTurn => {

    const id = snapshot.id;
    let startTime = snapshot.startTime;
    const charactersOrdered = snapshot.order.map(id => characters.find(c => c.id === id)!);

    const waitingTurns: TurnSnapshot[] = [];

    let currentTurn: Turn;

    const setCurrentTurn = (turn: Turn): void => {
        currentTurn = turn;
        turn.refreshTimedActions();
    };

    const getCurrentCharacterIndex = (): number => {
        return charactersOrdered.findIndex(c => c.id === currentTurn.character.id);
    };

    const checkWaitingTurns = (): boolean => {
        if (currentTurn.state !== 'ended') {
            return false;
        }

        const snapshot = waitingTurns.shift();
        if (snapshot) {
            setCurrentTurn(
                createTurnFromSnapshot(snapshot)
            );
            return true;
        }

        return false;
    };

    const runNextTurn = (nextCharacterIndex: number): void => {

        if (nextCharacterIndex >= charactersOrdered.length) {
            onGlobalTurnEnd(currentTurn.endTime);
        }
        else {
            const currentCharacter = charactersOrdered[ nextCharacterIndex ];

            if (currentCharacter.isAlive) {
                const turnId = generateTurnId.next().value;
                setCurrentTurn(turnCreator(turnId, currentTurn.endTime + TURN_DELAY, currentCharacter, onTurnEnd));
            } else {
                runNextTurn(nextCharacterIndex + 1);
            }
        }
    };

    const onTurnEnd = (): void => {
        if (checkWaitingTurns()) {
            return;
        }

        const currentCharacterIndex = getCurrentCharacterIndex();

        runNextTurn(currentCharacterIndex + 1);
    };

    const createTurnFromSnapshot = ({ id, startTime, characterId }: TurnSnapshot): Turn => {
        generateTurnId.next();

        const character = assertThenGet(
            charactersOrdered.find(c => c.id === characterId),
            assertIsDefined
        );

        return turnCreator(id, startTime, character, onTurnEnd);
    };

    generateTurnId.next();  // To start from 1

    currentTurn = createTurnFromSnapshot(snapshot.currentTurn);

    const synchronizeTurn = (turnSnapshot: TurnSnapshot): void => {
        if (turnSnapshot.id === currentTurn.id) {
            currentTurn.synchronize(turnSnapshot);
        } else {
            waitingTurns.push(turnSnapshot);
            checkWaitingTurns();
        }
    };

    return {
        id,
        get currentTurn() {
            return currentTurn;
        },
        get state(): GlobalTurnState {
            const now = Date.now();
            if (now >= startTime) {
                return 'running';
            }
            return 'idle';
        },
        start(): void {
            currentTurn.refreshTimedActions();
        },
        notifyDeaths(): void {
            if (!currentTurn.character.isAlive) {
                onTurnEnd();
            }
        },
        synchronize(snapshot: GlobalTurnSnapshot) {
            startTime = snapshot.startTime;
            synchronizeTurn(snapshot.currentTurn);
        },
        synchronizeTurn
    };
};
