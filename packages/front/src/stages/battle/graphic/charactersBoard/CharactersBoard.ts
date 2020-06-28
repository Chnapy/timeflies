import { denormalize, characterIsAlive } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { requestRender } from '../../../../canvas/GameCanvas';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { getBattleData } from '../../snapshot/snapshot-reducer';
import { CharacterGraphic } from './characterGraphic/CharacterGraphic';

export interface CharactersBoard {
    readonly container: PIXI.Container;
}

export const CharactersBoard = (period: BattleDataPeriod) => {

    const { storeEmitter } = CanvasContext.consumer('storeEmitter');

    const charactersGraphics: CharacterGraphic[] = [];

    const container = new PIXI.Container();

    storeEmitter.onStateChange(
        state => denormalize(getBattleData(state.battle.snapshotState, period).characters)
            .filter(c => characterIsAlive(c))
            .map(c => c.id),
        charactersAliveIds => {
            container.removeChildren().forEach(c => c.destroy());
            charactersGraphics.splice(0, Infinity);

            if (charactersAliveIds.length) {
                charactersGraphics.push(...charactersAliveIds
                    .map(id => CharacterGraphic(id, period)));

                container.addChild(...charactersGraphics.map(c => c.container));
            }

            requestRender();
        },
        shallowEqual
    );

    return {
        container
    };
};
