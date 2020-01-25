import { Character } from "../entities/Character";
import { CurrentSpell } from "../spellEngine/SpellEngine";
import { CharAction } from "./CycleManager";
import { TurnSnapshot } from "@shared/Turn";
import { Controller } from "../../Controller";
import { BattleTurnStartAction, BattleTurnEndAction } from "../battleReducers/BattleReducerManager";

// TODO monorepo
export interface TurnIDGenerator {
    (): number;
    nbTurns: number;
    increment(): void;
}

export function getTurnIdGenerator(): TurnIDGenerator {
    let nbTurns = 0;

    const fn = (): number => nbTurns++;

    return Object.assign(fn, {
        get nbTurns(): number {
            return nbTurns;
        },
        increment: () => { nbTurns++; }
    });
}

export type TurnState = 'idle' | 'running' | 'ended';

export class Turn {

    private static generateId: TurnIDGenerator = getTurnIdGenerator();

    static create(startTime: number, currentCharacter: Character, onTurnEnd: () => void) {
        return new Turn(Turn.generateId(), startTime, currentCharacter, onTurnEnd);
    }

    static fromSnapshot(snapshot: TurnSnapshot, characters: readonly Character[], onTurnEnd: () => void): Turn {
        Turn.generateId.increment();
        return new Turn(snapshot.id, snapshot.startTime, characters.find(c => c.id === snapshot.characterId)!, onTurnEnd);
    }

    readonly id: number;
    private _startTime: number;
    readonly currentCharacter: Character;
    currentSpell?: CurrentSpell;
    readonly charActionStack: CharAction[];

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
        return this.currentCharacter.features.actionTime;
    }

    get endTime(): number {
        return this.startTime + this.turnDuration;
    }

    private timedActionTimeout?: NodeJS.Timeout;
    private readonly onTurnEnd: () => void;

    private constructor(id: number, startTime: number, currentCharacter: Character, onTurnEnd: () => void) {
        this.id = id;
        this._startTime = startTime;
        this.currentCharacter = currentCharacter;
        this.charActionStack = [];
        this.onTurnEnd = onTurnEnd;
        this.refreshTimedActions();
    }

    synchronize(snapshot: TurnSnapshot): void {
        this._startTime = snapshot.startTime;
        this.refreshTimedActions();
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
        } else if (this.state === 'running') {
            const diff = this.endTime - now;
            this.timedActionTimeout = setTimeout(this.end, diff);
        }
    }

    private start = (): void => {
        Controller.dispatch<BattleTurnStartAction>({
            type: 'battle/turn/start',
            character: this.currentCharacter,
            startTime: this.startTime
        });
        this.refreshTimedActions();
    };

    private end = (): void => {
        this.onTurnEnd();
        Controller.dispatch<BattleTurnEndAction>({
            type: 'battle/turn/end',
            character: this.currentCharacter
        });
        this.refreshTimedActions();
    };
}
