import { BCharacter } from "../shared/Character";
import { TurnIDGenerator } from "../shared/getTurnIdGenerator";
import { TURN_DELAY } from "../shared/TurnSnapshot";
import { BTurn } from "./BTurn";
import { GlobalTurnSnapshot } from "../shared/GlobalTurnSnapshot";

export type GlobalState = 'idle' | 'running';

export class BGlobalTurn {

    id: number;
    startTime: number;
    charactersOrdered: readonly BCharacter[];
    private _currentTurn!: BTurn;
    private currentCharacterIndex!: number;
    private readonly generateTurnId: TurnIDGenerator;
    private readonly onGlobalTurnEnd: (endTime: number) => void;
    private readonly onTurnStart: () => void;

    get state(): GlobalState {
        const now = Date.now();
        if (now > this.startTime) {
            return 'running';
        }
        return 'idle';
    }

    get currentTurn(): BTurn {
        return this._currentTurn;
    }

    private setCurrentTurn(turn: BTurn) {
        this._currentTurn = turn;
        this.currentCharacterIndex = this.charactersOrdered.findIndex(c => c.id === turn.character.id);
    }

    constructor(id: number, startTime: number, charactersOrdered: readonly BCharacter[], generateTurnId: TurnIDGenerator, onGlobalTurnEnd: (endTime: number) => void, onTurnStart: () => void) {
        this.id = id;
        this.startTime = startTime;
        this.charactersOrdered = charactersOrdered;
        this.generateTurnId = generateTurnId;
        this.onGlobalTurnEnd = onGlobalTurnEnd;
        this.onTurnStart = onTurnStart;
        this.setCurrentTurn(new BTurn(generateTurnId(), startTime, this.charactersOrdered[0], () => null, this.onTurnEnd));
    }

    private onTurnEnd = (): void => {
        console.log('GT-TURN-ONEND', this.id, this.currentCharacterIndex);
        if (this.currentCharacterIndex === this.charactersOrdered.length - 1) {
            this.onGlobalTurnEnd(this.currentTurn.endTime);
        }
        else {
            const currentCharacter = this.charactersOrdered[this.currentCharacterIndex + 1];
            this.setCurrentTurn(new BTurn(this.generateTurnId(), this.currentTurn.endTime + TURN_DELAY, currentCharacter, this.onTurnStart, this.onTurnEnd));
        }
    };

    toSnapshot(): GlobalTurnSnapshot {
        return {
            id: this.id,
            startTime: this.startTime,
            order: this.charactersOrdered.map(c => c.staticData.id),
            currentTurn: this.currentTurn.toSnapshot()
        };
    }
}
