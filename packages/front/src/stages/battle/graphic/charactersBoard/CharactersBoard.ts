import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../BattleData';
import { serviceBattleData } from '../../../../services/serviceBattleData';
import { Character } from '../../entities/character/Character';
import { CharacterGraphic } from './characterGraphic/CharacterGraphic';
import { serviceEvent } from '../../../../services/serviceEvent';
import { SpellActionTimerEndAction } from '../../spellAction/SpellActionTimer';
import { requestRender } from '../../../../canvas/GameCanvas';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

export const CharactersBoard = (period: BattleDataPeriod) => {

    const { onAction } = serviceEvent();

    const characters: Character<BattleDataPeriod>[] = serviceBattleData(period).characters;

    const charactersGraphics = characters.map(c => CharacterGraphic(c));

    const container = new PIXI.Container();
    container.addChild(...charactersGraphics.map(c => c.container));

    onAction<SpellActionTimerEndAction>('battle/spell-action/end', () => {

        charactersGraphics
            .filter(cg => !cg.character.isAlive)
            .forEach(({ container: characterContainer }) => {
                // TODO handle risk of memory leaks
                // because of graphics retained by 'onAction' callbacks 
                container.removeChild(characterContainer);
            });
        requestRender();
    });

    return {
        container
    };
};
