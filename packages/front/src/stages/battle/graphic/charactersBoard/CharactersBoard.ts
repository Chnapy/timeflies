import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../BattleData';
import { serviceBattleData } from '../../../../services/serviceBattleData';
import { Character } from '../../entities/character/Character';
import { CharacterGraphic } from './characterGraphic/CharacterGraphic';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

export const CharactersBoard = (period: BattleDataPeriod) => {

    const characters: Character<BattleDataPeriod>[] = serviceBattleData(period).characters;

    const charactersGraphics = characters.map(c => CharacterGraphic(c));

    const container = new PIXI.Container();
    container.addChild(...charactersGraphics.map(c => c.container));

    return {
        container
    };
};
