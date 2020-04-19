import { SpellActionCAction } from "@timeflies/shared";
import { Cycle } from '../cycle/Cycle';
import { Player } from "../entities/player/Player";
import { MapManager } from '../mapManager/MapManager';
import { checkerPlayer } from './checkers/checkerPlayer';
import { checkerCharacter } from './checkers/checkerCharacter';
import { checkerTime } from './checkers/checkerTime';

export type CharActionCheckerReason = 'player' | 'isAlive' | 'spell' | 'startTime' | 'duration' | 'isInArea' | 'bresenham' | 'specificType';

export type CharActionCheckerResult =
    | {
        success: true;
    }
    | {
        success: false;
        reason: CharActionCheckerReason;
    };

export interface Checker {
    (action: SpellActionCAction, player: Player): CharActionCheckerResult;
}

export interface CheckerCreator {
    (cycle: Cycle, mapManager: MapManager): Checker;
}

export interface SpellActionChecker {
    check: Checker;
}

interface Dependencies {
    checkersCreators: CheckerCreator[];
}

export const SpellActionChecker = (
    cycle: Cycle, mapManager: MapManager,
    { checkersCreators }: Dependencies = {
        checkersCreators: [
            checkerPlayer,
            checkerCharacter,
            checkerTime,
        ]
    }
): SpellActionChecker => {

    // const checkPositions: Checker = ({ spellAction }) => {
    //     const { spellId, position } = spellAction;

    //     const { globalTurn: globalTurnState } = cycle;

    //     const { currentTurn: { character }, charactersOrdered } = globalTurnState;

    //     const { position: startPos } = character;

    //     const spell = character.spells.find(s => s.staticData.id === spellId)!;

    //     const { features: { area } } = spell;

    //     // TODO use tiled manager

    //     // const [endPos] = positions;

    //     // Check if in spell area

    //     let isInArea: boolean = false;
    //     let sum = 0;
    //     // for (let i = 0; i <= area * 2; i++) {
    //     //     for (let k = 0; k <= (i - sum) * 2; k++) {

    //     //         const currentPos: Position = {
    //     //             x: startPos.x - i + sum + k,
    //     //             y: startPos.y - area + i
    //     //         };

    //     //         if (currentPos.x === endPos.x && currentPos.y === endPos.y) {
    //     //             isInArea = true;
    //     //             break;
    //     //         }
    //     //     }

    //     //     if (isInArea) {
    //     //         break;
    //     //     }

    //     //     if (i >= area) {
    //     //         sum += 2;
    //     //     }
    //     // }

    //     if (!isInArea) {
    //         console.log('check isInArea');
    //         // TODO debug
    //         // return {
    //         //     success: false,
    //         //     reason: 'isInArea'
    //         // };
    //     }

    //     // Check obstacles

    //     // const line = this.map.getBresenhamLine(startPos, endPos)
    //     //     .slice(1);

    //     // if (line.some(({ d }) => d !== 0)) {
    //     //     console.log('check bresenham');
    //     //     // TODO debug
    //     //     // return {
    //     //     //     success: false,
    //     //     //     reason: 'bresenham'
    //     //     // };
    //     // }

    //     // Check occupation

    //     // const occupiedPath = line.map(({ x, y }) => charactersOrdered
    //     //     .some(({ isAlive, position: p }) => isAlive && p.x === x && p.y === y));

    //     switch (spell.staticData.type) {
    //         case 'move':
    //             // if (occupiedPath.some(v => v)) {
    //             //     console.log('check move');
    //             //     // TODO debug
    //             //     // return {
    //             //     //     success: false,
    //             //     //     reason: 'specificType'
    //             //     // };
    //             // }
    //             break;
    //         default:
    //             // if (occupiedPath
    //             //     .slice(0, occupiedPath.length - 1)
    //             //     .some(v => v)) {
    //             //     console.log('check default');
    //             //     return {
    //             //         success: false,
    //             //         reason: 'specificType'
    //             //     };
    //             // }
    //             break;
    //     }

    //     return {
    //         success: true
    //     };
    // };

    const checkList: readonly Checker[] = checkersCreators.map(c => c(cycle, mapManager));

    return {
        check: (action: SpellActionCAction, player: Player): CharActionCheckerResult => {

            for (const c of checkList) {
                const result = c(action, player);
                if (!result.success) {
                    return result;
                }
            }

            return { success: true };
        }
    }
};
