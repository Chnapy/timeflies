import { TurnSnapshot } from "@timeflies/shared";
import { Character } from "../../entities/Character";

export type TurnState = 'idle' | 'running' | 'ended';

export interface Turn {
    readonly id: number;
    readonly character: Character;
    readonly state: TurnState;
    readonly startTime: number;
    readonly turnDuration: number;
    readonly endTime: number;
    refreshTimedActions(): void;
    clearTimedActions(): void;
    toSnapshot(): TurnSnapshot;
}

export const Turn = (
    id: number, startTime: number, character: Character,
    onTurnStart: () => void, onTurnEnd: () => void
): Turn => {

    let timedActionTimeout: NodeJS.Timeout | undefined;
    let lastCallback: 'start' | 'end' | undefined;

    const clearTimedActions = (): void => {
        if (timedActionTimeout) {
            clearTimeout(timedActionTimeout);
            timedActionTimeout = undefined;
        }
    };

    const toSnapshot = (): TurnSnapshot => {
        return {
            id,
            startTime,
            characterId: character.id
        };
    };

    const refreshTimedActions = (): void => {
        clearTimedActions();

        const now = Date.now();

        if (this_.state === 'idle') {
            if (!lastCallback) {
                const diff = startTime - now;
                timedActionTimeout = setTimeout(start, diff);
            }
        }

        else {

            if (!lastCallback) {
                start();
                return;
            }

            if (lastCallback === 'start') {
                const diff = this_.endTime - now;
                timedActionTimeout = setTimeout(end, diff);
            }

        }
    }

    const start = (): void => {
        console.log('TURN-START', id, `${this_.turnDuration}ms`, character.player.id);
        lastCallback = 'start';
        onTurnStart();
        refreshTimedActions();
    };

    const end = (): void => {
        console.log('TURN-END', id);
        lastCallback = 'end';
        onTurnEnd();
    };

    const this_: Turn = {
        id,
        startTime,
        character,
        get state(): TurnState {
            const now = Date.now();
            if (now < this_.startTime) {
                return 'idle';
            }
            if (now < this_.endTime) {
                return 'running';
            }
            return 'ended';
        },
        get turnDuration(): number {
            return character.features.actionTime;
        },
        get endTime(): number {
            return startTime + this_.turnDuration;
        },
        refreshTimedActions,
        clearTimedActions,
        toSnapshot
    };

    return this_;
}
