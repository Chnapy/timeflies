import { CharActionCAction } from '../../shared/action/BattleRunAction';
import { Position } from '../../shared/Character';
import { BPlayer } from '../../shared/Player';
import { BRCycle } from './BRCycle';
import { BRMap } from './BRMap';

export class BRCharActionChecker {

    private readonly checkList: readonly ((action: CharActionCAction, player: BPlayer) => boolean)[];

    private readonly cycle: BRCycle;
    private readonly map: BRMap;

    constructor(cycle: BRCycle, map: BRMap) {
        this.cycle = cycle;
        this.map = map;
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
        const { currentTurn } = this.cycle.globalTurn;

        if (currentTurn.character.player.id !== player.id) {
            console.log('check player');
            return false;
        }

        return true;
    }

    private checkCharacter({ charAction }: CharActionCAction, player: BPlayer): boolean {
        const { currentTurn: {
            character
        } } = this.cycle.globalTurn;

        if (!character.isAlive) {
            console.log('check isAlive');
            return false;
        }

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId);

        if (!spell) {
            console.log('check spell');
            return false;
        }

        return true;
    }

    private checkTime({ sendTime, charAction }: CharActionCAction): boolean {
        const { currentTurn } = this.cycle.globalTurn;

        if (sendTime < currentTurn.startTime) {
            console.log('check startTime');
            return false;
        }

        const { character, turnDuration } = currentTurn;

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId)!;

        if (sendTime - currentTurn.startTime + spell.features.duration > turnDuration) {
            console.log('check duration');
            return false;
        }

        return true;
    }

    private checkPositions({ charAction }: CharActionCAction): boolean {
        const { spellId, positions } = charAction;

        const { globalTurn: globalTurnState } = this.cycle;

        const { currentTurn: { character }, charactersOrdered } = globalTurnState;

        const { position: startPos } = character;

        const spell = character.spells.find(s => s.staticData.id === spellId)!;

        const { features: { area } } = spell;

        const [endPos] = positions;

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
            console.log('check isInArea');
            return false;
        }

        // Check obstacles

        const line = this.map.getBresenhamLine(startPos, endPos)
            .slice(1);

        if (line.some(({ d }) => d !== 0)) {
            console.log('check bresenham');
            return false;
        }

        // Check occupation

        const occupiedPath = line.map(({ x, y }) => charactersOrdered
            .some(({ position: p }) => p.x === x && p.y === y));

        switch (spell.staticData.type) {
            case 'move':
                if (occupiedPath.some(v => v)) {
                    console.log('check move');
                    return false;
                }
                break;
            default:
                if (occupiedPath
                    .slice(0, occupiedPath.length - 1)
                    .some(v => v)) {
                        console.log('check default');
                    return false;
                }
                break;
        }

        return true;
    }
}
