import { TurnSnapshot, WaitTimeoutPromise } from "@timeflies/shared";
import { Immutable } from 'immer';
import { Character } from "../../entities/character/Character";
import { waitTimeoutPool } from '../../../../wait-timeout-pool';

export type TurnState = 'idle' | 'running' | 'ended';

export interface Turn {
    readonly id: number;
    readonly getCharacter: () => Immutable<Character>;
    readonly state: TurnState;
    readonly startTime: number;
    readonly turnDuration: number;
    readonly endTime: number;
    refreshTimedActions(): WaitTimeoutPromise<unknown> | undefined;
    clearTimedActions(): void;
    toSnapshot(): TurnSnapshot;
}

export const Turn = (
    id: number, startTime: number, getCharacter: () => Immutable<Character>,
    onTurnStart: () => void, onTurnEnd: () => WaitTimeoutPromise<unknown> | undefined
): Turn => {

    let timedActionTimeout: WaitTimeoutPromise<unknown> | undefined;
    let lastCallback: 'start' | 'end' | undefined;

    const clearTimedActions = (): void => {
        if (timedActionTimeout) {
            timedActionTimeout.cancel();
            timedActionTimeout = undefined;
        }
    };

    const toSnapshot = (): TurnSnapshot => {
        return {
            id,
            startTime,
            duration: this_.turnDuration,
            characterId: getCharacter().id
        };
    };

    const refreshTimedActions = (): WaitTimeoutPromise<unknown> | undefined => {
        clearTimedActions();

        const now = Date.now();

        if (this_.state === 'idle') {
            if (!lastCallback) {
                const diff = startTime - now;
                timedActionTimeout = waitTimeoutPool.createTimeout(diff)
                    .onCompleted(start);
            }
        }

        else {

            if (!lastCallback) {
                return start();
            }

            if (lastCallback === 'start') {
                const diff = this_.endTime - now;
                timedActionTimeout = waitTimeoutPool.createTimeout(diff)
                    .onCompleted(end);
            }

        }

        return timedActionTimeout;
    };

    const start = () => {

        console.log();
        console.log('--- TURN-START ---');
        console.table({
            turnId: id,
            duration: this_.turnDuration,
            playerId: getCharacter().playerId,
            characterId: getCharacter().id
        });
        console.log('--- ---------- ---');
        console.log();

        lastCallback = 'start';
        onTurnStart();
        return refreshTimedActions();
    };

    const end = () => {
        console.log('TURN-END', id);
        lastCallback = 'end';
        return onTurnEnd();
    };

    const this_: Turn = {
        id,
        startTime,
        getCharacter,
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
            return getCharacter().features.actionTime;
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
