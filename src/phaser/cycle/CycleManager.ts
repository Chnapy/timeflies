import { IGameAction } from '../../action/GameAction';
import { Controller } from '../../Controller';
import { Character } from '../entities/Character';
import { CharAction } from '../entities/CharAction';
import { Player } from '../entities/Player';
import { GameManager } from '../GameManager';
import { CharActionSend, SendPromise, BattleRoomManager } from '../room/BattleRoomManager';
import { BattleScene } from '../scenes/BattleScene';

export interface CycleStartTurn extends IGameAction<'turn/start'> {
    character: Character;
}

export interface CycleEndTurn extends IGameAction<'turn/end'> {
    character: Character;
}

export type CycleAction =
    | CycleStartTurn
    | CycleEndTurn;

export class CycleManager extends GameManager {

    private readonly room: BattleRoomManager;

    readonly players: Player[];
    readonly characters: Character[];

    private running: boolean;

    currentIndex: number;
    lastTime?: number;

    charActionStack: CharAction[];

    constructor(scene: BattleScene, room: BattleRoomManager) {
        super(scene);
        this.room = room;
        this.players = scene.players;
        this.characters = scene.characters;
        this.currentIndex = 0;
        this.running = false;
        this.charActionStack = [];
    }

    start(): void {
        this.running = true;
    }

    getCurrentCharacter(): Character {
        return this.characters[ this.currentIndex ];
    }

    update(time: number, delta: number): void {
        if (!this.running) {
            return;
        }

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

    addCharAction(charAction: CharAction): SendPromise<CharActionSend> {

        this.charActionStack.push(charAction);

        return this.room.send<CharActionSend>({
            type: 'charAction',
            charAction
        });
    }

    private startTurn(character: Character): void {
        this.charActionStack.length = 0;

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