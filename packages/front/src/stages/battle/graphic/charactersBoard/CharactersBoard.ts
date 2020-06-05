import * as PIXI from 'pixi.js';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { requestRender } from '../../../../canvas/GameCanvas';
import { characterIsAlive } from '../../entities/character/Character';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { getBattleData } from '../../snapshot/snapshot-reducer';
import { CharacterGraphic } from './characterGraphic/CharacterGraphic';
import { shallowEqual } from 'react-redux';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

export const CharactersBoard = (period: BattleDataPeriod) => {

    const { storeEmitter } = CanvasContext.consumer('storeEmitter');

    const charactersGraphics: CharacterGraphic[] = [];

    const container = new PIXI.Container();

    storeEmitter.onStateChange(
        state => getBattleData(state.battle.snapshotState, period).characters
            .filter(c => characterIsAlive(c))
            .map(c => c.id),
        charactersAliveIds => {
            container.removeChildren().forEach(c => c.destroy());
            charactersGraphics.splice(0, Infinity);
            
            charactersGraphics.push(...charactersAliveIds
                .map(id => CharacterGraphic(id, period)));

            container.addChild(...charactersGraphics.map(c => c.container));

            requestRender();
        },
        shallowEqual
    );

    // onAction(SpellActionTimerEndAction, () => {

    //     charactersGraphics
    //         .filter(cg => !cg.character.isAlive)
    //         .forEach(({ container: characterContainer }) => {
    //             // TODO handle risk of memory leaks
    //             // because of graphics retained by 'onAction' callbacks 
    //             container.removeChild(characterContainer);
    //         });
    //     requestRender();
    // });

    return {
        container
    };
};
