import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { IGameAction } from '../../action/GameAction';
import { BattleScene } from '../scenes/BattleScene';
import { Controller } from '../../Controller';

export interface CycleStartTurn extends IGameAction<'turn/start'> {
    character: Character;
}

export interface CycleEndTurn extends IGameAction<'turn/end'> {
    character: Character;
}

export type CycleAction =
    | CycleStartTurn
    | CycleEndTurn;

export class Cycle {

    readonly scene: BattleScene;
    readonly players: Player[];
    readonly characters: Character[];

    currentIndex: number;
    lastTime?: number;

    constructor(scene: BattleScene) {
        this.scene = scene;
        this.players = scene.players;
        this.characters = this.players.flatMap(player => player.characters);
        this.currentIndex = 0;
    }

    getCurrentCharacter(): Character {
        return this.characters[ this.currentIndex ];
    }

    update(time: number): void {
        if (!this.lastTime) {
            this.lastTime = time;
            this.currentIndex = 0;
            this.startTurn(this.getCurrentCharacter());
            return;
        }

        const currentCharacter = this.getCurrentCharacter();
        const elapsedTime = time - this.lastTime;
        const { actionTime } = currentCharacter;

        if (elapsedTime > actionTime) {
            this.endTurn(currentCharacter);

            this.lastTime += actionTime;
            this.currentIndex++;
            if (this.currentIndex >= this.characters.length) {
                this.currentIndex = 0;
            }

            this.startTurn(this.getCurrentCharacter());
        }
    }

    private startTurn(character: Character): void {
        Controller.dispatch<CycleStartTurn>({
            type: 'turn/start',
            character
        });
    }

    private endTurn(character: Character): void {
        Controller.dispatch<CycleEndTurn>({
            type: 'turn/end',
            character
        });
    }

}