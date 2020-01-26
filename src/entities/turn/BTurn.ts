import { BCharacter } from "../../shared/Character";
import { TurnSnapshot } from "../../shared/TurnSnapshot";

export type TurnState = 'idle' | 'running' | 'ended';

export class BTurn {

    readonly id: number;
    private _startTime: number;
    readonly character: BCharacter;

    get state(): TurnState {
        const now = Date.now();
        if (now < this.startTime) {
            return 'idle';
        }
        if (now < this.endTime) {
            return 'running';
        }
        return 'ended';
    }

    get startTime(): number {
        return this._startTime;
    }

    get turnDuration(): number {
        return this.character.features.actionTime;
    }

    get endTime(): number {
        return this.startTime + this.turnDuration;
    }

    private timedActionTimeout?: NodeJS.Timeout;
    private readonly onTurnStart: () => void;
    private readonly onTurnEnd: () => void;

    constructor(id: number, startTime: number, character: BCharacter, onTurnStart: () => void, onTurnEnd: () => void) {
        this.id = id;
        this._startTime = startTime;
        this.character = character;
        this.onTurnStart = onTurnStart;
        this.onTurnEnd = onTurnEnd;
        this.refreshTimedActions();
    }

    toSnapshot(): TurnSnapshot {
        return {
            id: this.id,
            startTime: this.startTime,
            characterId: this.character.staticData.id
        };
    }

    private refreshTimedActions(): void {
        if (this.timedActionTimeout) {
            clearTimeout(this.timedActionTimeout);
            delete this.timedActionTimeout;
        }
        const now = Date.now();
        if (this.state === 'idle') {
            const diff = this.startTime - now;
            this.timedActionTimeout = setTimeout(this.start, diff);
        }
        else if (this.state === 'running') {
            const diff = this.endTime - now;
            this.timedActionTimeout = setTimeout(this.end, diff);
        }
    }

    private start = (): void => {
        console.log('TURN-START', this.id);
        this.onTurnStart();
        this.refreshTimedActions();
    };

    private end = (): void => {
        console.log('TURN-END', this.id);
        this.onTurnEnd();
        this.refreshTimedActions();
    };
}
