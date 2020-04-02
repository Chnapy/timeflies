import PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../BattleData';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

// battleData period
// tiledManager || mapManager
export const CharactersBoard = (period: BattleDataPeriod) => {

    // get characters

    // link with asset manager

    // create sprite w/ spritesheet, animations

    // use position & orientation

    // on position change

    // anim only in 'current' period

    const container = new PIXI.Container();

    return {
        container
    };
};
