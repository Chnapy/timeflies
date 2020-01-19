import { CharActionCAction } from '../../shared/action/BattleRunAction';
import { BPlayer } from '../../shared/Player';
import { BattleRunRoom } from './BattleRunRoom';
import { Position } from '../../shared/Character';

export class BRCharActionChecker {

    private readonly checkList: readonly ((action: CharActionCAction, player: BPlayer) => boolean)[];

    private readonly room: BattleRunRoom;

    constructor(room: BattleRunRoom) {
        this.room = room;
        this.checkList = [
            this.checkPlayer,
            this.checkCharacter,
            this.checkTime,
            this.checkPositions
        ].map(c => c.bind(this));
    }

    check(action: CharActionCAction, player: BPlayer): boolean {
        return this.checkList.every(c => c(action, player));
    }

    private checkPlayer(action: CharActionCAction, player: BPlayer): boolean {
        const { currentTurn } = this.room.globalTurnState;

        if (currentTurn.character.player.id !== player.id) {
            return false;
        }

        return true;
    }

    private checkCharacter({ charAction }: CharActionCAction, player: BPlayer): boolean {
        const { currentTurn: {
            character
        } } = this.room.globalTurnState;

        if (!character.isAlive) {
            return false;
        }

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId);

        if (!spell) {
            return false;
        }

        return true;
    }

    private checkTime({ sendTime, charAction }: CharActionCAction): boolean {
        const { currentTurn } = this.room.globalTurnState;

        if (sendTime < currentTurn.startTime) {
            return false;
        }

        const { character, estimatedDuration } = currentTurn;

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId)!;

        if (sendTime - currentTurn.startTime + spell.features.duration > estimatedDuration) {
            return false;
        }

        return true;
    }

    private checkPositions({ charAction }: CharActionCAction): boolean {
        const { spellId, positions } = charAction;

        const { map, globalTurnState } = this.room;

        const { currentTurn: { character }, charactersOrdered } = globalTurnState;

        const { position: startPos } = character;

        const spell = character.spells.find(s => s.staticData.id === spellId)!;

        const { features: { area } } = spell;

        const [ endPos ] = positions;

        // Check if in spell area

        let isInArea: boolean = false;
        let sum = 0;
        for (let i = 0; i <= area * 2; i++) {
            for (let k = 0; k <= (i - sum) * 2; k++) {

                const currentPos: Position = {
                    x: startPos.x - i + sum + k,
                    y: startPos.y - area + i
                };

                if (currentPos.x === endPos.x && currentPos.y === endPos.y) {
                    isInArea = true;
                    break;
                }
            }

            if (isInArea) {
                break;
            }

            if (i >= area) {
                sum += 2;
            }
        }

        if (!isInArea) {
            return false;
        }

        // Check obstacles

        const line = map.getBresenhamLine(startPos, endPos)
            .slice(1);

        if (line.some(({ d }) => d !== 0)) {
            return false;
        }

        // Check occupation

        const occupiedPath = line.map(({ x, y }) => charactersOrdered
            .some(({ position: p }) => p.x === x && p.y === y));

        switch (spell.staticData.type) {
            case 'move':
                if (occupiedPath.some(v => v)) {
                    return false;
                }
                break;
            default:
                if (occupiedPath
                    .slice(0, occupiedPath.length - 1)
                    .some(v => v)) {
                    return false;
                }
                break;
        }

        return true;
    }
}
