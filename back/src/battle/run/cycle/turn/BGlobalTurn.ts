import { BCharacter } from "../../entities/BCharacter";
import { TurnIDGenerator } from "../../../../shared/getTurnIdGenerator";
import { TURN_DELAY } from "../../../../shared/TurnSnapshot";
import { BTurn } from "./BTurn";
import { GlobalTurnSnapshot } from "../../../../shared/GlobalTurnSnapshot";

export type GlobalTurnState = 'idle' | 'running';

export class BGlobalTurn {

    id: number;
    startTime: number;
    charactersOrdered: readonly BCharacter[];
    private _currentTurn!: BTurn;
    private readonly generateTurnId: TurnIDGenerator;
    private readonly onGlobalTurnEnd: (endTime: number) => void;
    private readonly onTurnStart: () => void;

    get state(): GlobalTurnState {
        const now = Date.now();
        if (now >= this.startTime) {
            return 'running';
        }
        return 'idle';
    }

    get currentTurn(): BTurn {
        return this._currentTurn;
    }

    private setCurrentTurn(turn: BTurn) {
        if (this._currentTurn)
            this._currentTurn.clearTimedActions();

        this._currentTurn = turn;
        turn.refreshTimedActions();
    }

    constructor(id: number, startTime: number, charactersOrdered: readonly BCharacter[], generateTurnId: TurnIDGenerator, onGlobalTurnEnd: (endTime: number) => void, onTurnStart: () => void) {
        this.id = id;
        this.startTime = startTime;
        this.charactersOrdered = [...charactersOrdered];
        this.generateTurnId = generateTurnId;
        this.onGlobalTurnEnd = onGlobalTurnEnd;
        this.onTurnStart = onTurnStart;

        const turnId = this.generateTurnId.next().value;
        this.setCurrentTurn(new BTurn(turnId, startTime, this.charactersOrdered[0], () => null, this.onTurnEnd));
    }

    notifyDeaths(): void {
        if (!this.currentTurn.character.isAlive) {
            this.onTurnEnd();
        }
    }

    private onTurnEnd = (): void => {
        this.currentTurn.clearTimedActions();

        const currentCharacterIndex = this.getCurrentCharacterIndex();

        this.runNextTurn(currentCharacterIndex + 1);
    };

    private runNextTurn(nextCharacterIndex: number): void {

        if (nextCharacterIndex >= this.charactersOrdered.length) {
            this.onGlobalTurnEnd(this.currentTurn.endTime);
        }
        else {
            const currentCharacter = this.charactersOrdered[nextCharacterIndex];
            if (currentCharacter.isAlive) {
                console.log(`Wait ${TURN_DELAY}ms`);
                const turnId = this.generateTurnId.next().value;
                this.setCurrentTurn(new BTurn(turnId, this.currentTurn.endTime + TURN_DELAY, currentCharacter, this.onTurnStart, this.onTurnEnd));
            } else {
                this.runNextTurn(nextCharacterIndex + 1);
            }
        }
    }

    private getCurrentCharacterIndex(): number {
        return this.charactersOrdered.findIndex(c => c.id === this.currentTurn.character.id);
    }

    toSnapshot(): GlobalTurnSnapshot {
        return {
            id: this.id,
            startTime: this.startTime,
            order: this.charactersOrdered.map(c => c.staticData.id),
            currentTurn: this.currentTurn.toSnapshot()
        };
    }
}
