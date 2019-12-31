import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { BattleTurnEndAction, BattleTurnStartAction } from '../battleReducers/BattleReducerManager';
import { Character, Position } from '../entities/Character';
import { Player } from '../entities/Player';
import { BattleRoomManager, CharActionSend, SendPromise } from '../room/BattleRoomManager';
import { BattleData } from '../scenes/BattleScene';
import { Spell } from '../entities/Spell';

export interface CharAction {
    spell: Spell;
    position: Position;
    startTime: number;
}

export class CycleManager {

    private readonly room: BattleRoomManager;
    private readonly dataStateManager: DataStateManager;
    private readonly battleData: BattleData;

    readonly players: readonly Player[];
    readonly characters: readonly Character[];

    private running: boolean;

    private currentIndex: number;
    private lastTime?: number;

    private charActionStack: CharAction[];

    constructor(room: BattleRoomManager, dataStateManager: DataStateManager, battleData: BattleData) {
        this.room = room;
        this.dataStateManager = dataStateManager;
        this.battleData = battleData;
        this.players = battleData.players;
        this.characters = battleData.characters;
        this.currentIndex = 0;
        this.running = false;
        this.charActionStack = battleData.charActionStack;
    }

    start(): void {
        this.running = true;
    }

    update(time: number, delta: number): void {
        if (!this.running) {
            return;
        }

        if (!this.lastTime) {
            this.lastTime = time;
            this.currentIndex = 0;
            this.startTurn(this.getCurrentCharacter(), time);
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

            this.startTurn(this.getCurrentCharacter(), this.lastTime);
        }
    }

    addCharAction(charAction: CharAction): SendPromise<CharActionSend> {

        this.dataStateManager.commit(charAction.startTime);

        this.charActionStack.push(charAction);

        return this.room.send<CharActionSend>({
            type: 'charAction',
            charAction: {
                spellId: charAction.spell.id,
                position: charAction.position
            }
        }, charAction.startTime);
    }

    private startTurn(character: Character, time: number): void {
        this.charActionStack.length = 0;

        this.battleData.currentCharacter = character;

        Controller.dispatch<BattleTurnStartAction>({
            type: 'battle/turn/start',
            character,
            time
        });
    }

    private endTurn(character: Character): void {
        Controller.dispatch<BattleTurnEndAction>({
            type: 'battle/turn/end',
            character
        });
    }

    private getCurrentCharacter(): Character {
        return this.characters[ this.currentIndex ];
    }
}