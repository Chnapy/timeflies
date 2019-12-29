import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { BattleTurnEndAction, BattleTurnStartAction } from '../battleReducers/BattleReducerManager';
import { Character, Position } from '../entities/Character';
import { Player } from '../entities/Player';
import { BattleRoomManager, CharActionSend, SendPromise } from '../room/BattleRoomManager';

export type CharAction = {
    sortId: number;
    position: Position;
};

export class CycleManager {

    private readonly room: BattleRoomManager;
    private readonly dataStateManager: DataStateManager;

    readonly players: readonly Player[];
    readonly characters: readonly Character[];

    private running: boolean;

    private currentIndex: number;
    private lastTime?: number;

    private charActionStack: CharAction[];

    constructor(room: BattleRoomManager, dataStateManager: DataStateManager, players: Player[], characters: Character[]) {
        this.room = room;
        this.dataStateManager = dataStateManager;
        this.players = players;
        this.characters = characters;
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

        const time = this.dataStateManager.commit();

        this.charActionStack.push(charAction);

        return this.room.send<CharActionSend>({
            type: 'charAction',
            charAction
        }, time);
    }

    private startTurn(character: Character): void {
        this.charActionStack.length = 0;

        Controller.dispatch<BattleTurnStartAction>({
            type: 'battle/turn/start',
            character
        });
    }

    private endTurn(character: Character): void {
        Controller.dispatch<BattleTurnEndAction>({
            type: 'battle/turn/end',
            character
        });
    }

}