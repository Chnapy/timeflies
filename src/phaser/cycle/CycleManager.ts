import { CharActionCAction } from '@shared/action/BattleRunAction';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { BattleTurnEndAction, BattleTurnStartAction } from '../battleReducers/BattleReducerManager';
import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { Spell } from '../entities/Spell';
import { BattleRoomManager, SendPromise } from '../room/BattleRoomManager';
import { BattleData } from '../scenes/BattleScene';
import { CurrentSpell } from '../spellEngine/SpellEngine';
import { Position } from '@shared/Character';

export interface GameTime {
    phaserTime: number;
    dateTime: number;
}

export interface Turn {
    readonly startTime: Readonly<GameTime>;
    readonly turnDuration: number;
    readonly currentCharacter: Character;
    currentSpell?: CurrentSpell;
    readonly charActionStack: CharAction[];
}

//TODO handle state
export type CharActionState = 'running' | 'complete' | 'canceled';

export type CharAction<S extends CharActionState = CharActionState> = {
    state: S;
    spell: Spell;
    positions: Position[];
    startTime: number;
    duration: number;
} & (S extends 'canceled'
    ? {
        cancelTime: number;
    }
    : {});

export class CycleManager {

    private readonly room: BattleRoomManager;
    private readonly dataStateManager: DataStateManager;
    private readonly battleData: BattleData;

    readonly players: readonly Player[];
    readonly characters: readonly Character[];

    private running: boolean;

    private currentIndex: number;
    private lastTime?: number;

    private get charActionStack(): CharAction[] {
        return this.battleData.currentTurn!.charActionStack;
    }

    constructor(room: BattleRoomManager, dataStateManager: DataStateManager, battleData: BattleData) {
        this.room = room;
        this.dataStateManager = dataStateManager;
        this.battleData = battleData;
        this.players = battleData.players;
        this.characters = battleData.characters;
        this.currentIndex = 0;
        this.running = false;
    }

    start(): void {
        this.running = true;
        // setTimeout(() => this.running = false, 500);
    }

    update(time: number, delta: number): void {
        if (!this.running) {
            return;
        }

        if (!this.lastTime) {
            this.lastTime = time;
            this.currentIndex = 0;
            this.startTurn(this.getCurrentCharacter(), time, Date.now());
            return;
        }

        // const lastCharAction = this.charActionStack[this.charActionStack.length - 1];
        // if (lastCharAction && lastCharAction.state === 'running') {
        //     if (Date.now() > lastCharAction.startTime + lastCharAction.duration) {
        //         lastCharAction.state = 'complete';
        //     }
        // }

        const currentCharacter = this.getCurrentCharacter();
        const elapsedTime = time - this.lastTime;
        const { actionTime } = currentCharacter.features;

        if (elapsedTime > actionTime) {
            this.endTurn(currentCharacter);

            this.lastTime += actionTime;
            this.currentIndex++;
            if (this.currentIndex >= this.characters.length) {
                this.currentIndex = 0;
            }

            this.startTurn(this.getCurrentCharacter(), this.lastTime, Date.now());
        }
    }

    addCharAction(charAction: CharAction): SendPromise<CharActionCAction> {

        this.dataStateManager.commit(charAction.startTime);

        this.charActionStack.push(charAction);

        return this.room.send<CharActionCAction>({
            type: 'charAction',
            charAction: {
                spellId: charAction.spell.id,
                positions: charAction.positions
            }
        }, charAction.startTime);
    }

    cancelCharActionByTime(startTime: number, cancelTime: number): void {
        const charAction = this.charActionStack.find(ca => ca.startTime === startTime)!;
        charAction.state = 'canceled';
        (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
    }

    cancelCharActionLast(cancelTime: number): void {
        const charAction = this.charActionStack[this.charActionStack.length - 1];
        charAction.state = 'canceled';
        (charAction as CharAction<'canceled'>).cancelTime = cancelTime;
    }

    private startTurn(character: Character, phaserTime: number, dateTime: number): void {

        const startTime: GameTime = {
            phaserTime,
            dateTime
        };

        this.battleData.currentTurn = {
            startTime,
            turnDuration: character.features.actionTime,
            currentCharacter: character,
            charActionStack: []
        };

        Controller.dispatch<BattleTurnStartAction>({
            type: 'battle/turn/start',
            character,
            startTime
        });
    }

    private endTurn(character: Character): void {
        Controller.dispatch<BattleTurnEndAction>({
            type: 'battle/turn/end',
            character
        });
    }

    private getCurrentCharacter(): Character {
        return this.characters[this.currentIndex];
    }
}