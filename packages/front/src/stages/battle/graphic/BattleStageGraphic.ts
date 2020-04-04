import * as PIXI from 'pixi.js';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';
import { CharactersBoard } from './charactersBoard/CharactersBoard';

export const BattleStageGraphic: StageGraphicCreator<'mapManager' | 'spritesheets'> = () => {

    const container = new PIXI.Container();

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Battle stage', textStyle);
    container.addChild(text);

    return {
        onCreate(contextMap) {

            CanvasContext.provider(contextMap, () => {

                const tiledMapGraphic = TiledMapGraphic();

                CanvasContext.provider({ tiledMapGraphic }, () => {

                    const charactersBoardCurrent = CharactersBoard('current');
                    const charactersBoardFuture = CharactersBoard('future');

                    container.addChild(
                        tiledMapGraphic.container,
                        charactersBoardCurrent.container,
                        charactersBoardFuture.container
                    );
                });
            });
        },
        getContainer() {
            return container;
        }
    };
};
