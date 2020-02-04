import { GlobalTurnSnapshot, TurnSnapshot } from "@timeflies/shared";
import { Character } from "../entities/Character";
import { Turn } from "./Turn";

export type GlobalState = 'idle' | 'running';

export class GlobalTurn {

    readonly id: number;
    private startTime: number;
    private readonly charactersOrdered: Character[];
    private _currentTurn!: Turn;
    private currentCharacterIndex!: number;

    get state(): GlobalState {
        const now = Date.now();
        if (now > this.startTime) {
            return 'running';
        }
        return 'idle';
    }

    get currentTurn(): Turn {
        return this._currentTurn;
    }

    private setCurrentTurn(turn: Turn) {
        this._currentTurn = turn;
        this.currentCharacterIndex = this.charactersOrdered.findIndex(c => c.id === turn.currentCharacter.id);
    }

    private waitingTurns: TurnSnapshot[];
    private readonly onGlobalTurnEnd: (endTime: number) => void;

    constructor(snapshot: GlobalTurnSnapshot, characters: readonly Character[], onGlobalTurnEnd: (endTime: number) => void) {
        this.id = snapshot.id;
        this.startTime = snapshot.startTime;
        this.charactersOrdered = snapshot.order.map(id => characters.find(c => c.id === id)!);

        this.waitingTurns = [];
        this.onGlobalTurnEnd = onGlobalTurnEnd;

        this.setCurrentTurn(
            Turn.fromSnapshot(snapshot.currentTurn, this.charactersOrdered, this.onTurnEnd)
        );
    }

    synchronize(snapshot: GlobalTurnSnapshot) {
        this.startTime = snapshot.startTime;
        this.synchronizeTurn(snapshot.currentTurn);
    }

    synchronizeTurn(turnSnapshot: TurnSnapshot) {
        if (turnSnapshot.id === this.currentTurn.id) {
            this.currentTurn.synchronize(turnSnapshot);
        } else {
            this.waitingTurns.push(turnSnapshot);
            this.checkWaitingTurns();
        }
    }

    private onTurnEnd = (): void => {
        this.checkWaitingTurns();

        if (this.currentTurn.state !== 'ended') {
            return;
        }

        if (this.currentCharacterIndex === this.charactersOrdered.length - 1) {
            this.onGlobalTurnEnd(this.currentTurn.endTime);
        } else {
            const currentCharacter = this.charactersOrdered[this.currentCharacterIndex + 1];

            this.setCurrentTurn(Turn.create(
                this.currentTurn.endTime + 1000,
                currentCharacter,
                this.onTurnEnd
            ));
        }
    }

    private checkWaitingTurns(): void {
        if (this.currentTurn.state !== 'ended') {
            return;
        }

        const snapshot = this.waitingTurns.shift();
        if (snapshot) {
            this.setCurrentTurn(
                Turn.fromSnapshot(snapshot, this.charactersOrdered, this.onTurnEnd)
            );
        }
    }
}