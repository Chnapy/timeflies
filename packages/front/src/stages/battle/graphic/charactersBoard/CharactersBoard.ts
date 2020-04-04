import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../BattleData';
import { serviceBattleData } from '../../../../services/serviceBattleData';
import { CharacterGraphic } from './characterGraphic/CharacterGraphic';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

export const CharactersBoard = (period: BattleDataPeriod) => {

    const { characters } = serviceBattleData(period);

    const charactersGraphics = characters.map(c => CharacterGraphic(period, c));

    const container = new PIXI.Container();
    container.addChild(...charactersGraphics.map(c => c.container));

    return {
        container
    };
};
