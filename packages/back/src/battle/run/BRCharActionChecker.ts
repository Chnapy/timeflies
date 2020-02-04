import { CharActionCAction, Position } from "@timeflies/shared";
import { BRMap } from './BRMap';
import { BRCycle } from './cycle/BRCycle';
import { BPlayer } from "./entities/BPlayer";

export type CharActionCheckerReason = 'player' | 'isAlive' | 'spell' | 'startTime' | 'duration' | 'isInArea' | 'bresenham' | 'specificType';

export type CharActionCheckerResult =
    | {
        success: true;
    }
    | {
        success: false;
        reason: CharActionCheckerReason;
    };

export class BRCharActionChecker {

    private readonly checkList: readonly ((action: CharActionCAction, player: BPlayer) => CharActionCheckerResult)[];

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

    check(action: CharActionCAction, player: BPlayer): CharActionCheckerResult {

        for (const c of this.checkList) {
            const result = c(action, player);
            if (!result.success) {
                return result;
            }
        }

        return { success: true };
    }

    private checkPlayer(action: CharActionCAction, player: BPlayer): CharActionCheckerResult {
        const { currentTurn } = this.cycle.globalTurn;

        if (currentTurn.character.player.id !== player.id) {
            console.log('check player');
            return {
                success: false,
                reason: 'player'
            };
        }

        return {
            success: true
        };
    }

    private checkCharacter({ charAction }: CharActionCAction, player: BPlayer): CharActionCheckerResult {
        const { currentTurn: {
            character
        } } = this.cycle.globalTurn;

        if (!character.isAlive) {
            console.log('check isAlive');
            return {
                success: false,
                reason: 'isAlive'
            };
        }

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId);

        if (!spell) {
            console.log('check spell');
            return {
                success: false,
                reason: 'spell'
            };
        }

        return {
            success: true
        };
    }

    private checkTime({ sendTime, charAction }: CharActionCAction): CharActionCheckerResult {
        const { currentTurn } = this.cycle.globalTurn;

        if (sendTime < currentTurn.startTime) {
            console.log('check startTime');
            return {
                success: false,
                reason: 'startTime'
            };
        }

        const { character, turnDuration } = currentTurn;

        const spell = character.spells.find(s => s.staticData.id === charAction.spellId)!;

        if (sendTime - currentTurn.startTime + spell.features.duration > turnDuration) {
            console.log('check duration');
            return {
                success: false,
                reason: 'duration'
            };
        }

        return {
            success: true
        };
    }

    private checkPositions({ charAction }: CharActionCAction): CharActionCheckerResult {
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
            return {
                success: false,
                reason: 'isInArea'
            };
        }

        // Check obstacles

        const line = this.map.getBresenhamLine(startPos, endPos)
            .slice(1);

        if (line.some(({ d }) => d !== 0)) {
            console.log('check bresenham');
            return {
                success: false,
                reason: 'bresenham'
            };
        }

        // Check occupation

        const occupiedPath = line.map(({ x, y }) => charactersOrdered
            .some(({ isAlive, position: p }) => isAlive && p.x === x && p.y === y));

        switch (spell.staticData.type) {
            case 'move':
                if (occupiedPath.some(v => v)) {
                    console.log('check move');
                    return {
                        success: false,
                        reason: 'specificType'
                    };
                }
                break;
            default:
                if (occupiedPath
                    .slice(0, occupiedPath.length - 1)
                    .some(v => v)) {
                    console.log('check default');
                    return {
                        success: false,
                        reason: 'specificType'
                    };
                }
                break;
        }

        return {
            success: true
        };
    }
}
