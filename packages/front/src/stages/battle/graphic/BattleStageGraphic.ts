import * as PIXI from 'pixi.js';
import { StageGraphic, StageGraphicCreator } from '../../../canvas/StageGraphic';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';
import { CanvasContext } from '../../../canvas/CanvasContext';

export const BattleStageGraphic: StageGraphicCreator<'mapManager'> = () => {

    const container = new PIXI.Container();

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Battle stage', textStyle);
    container.addChild(text);

    return {
        onCreate(contextMap) {

            CanvasContext.provider(contextMap, () => {

                const mapGraphic = TiledMapGraphic();
                container.addChild(mapGraphic.container);

            });
        },
        getContainer() {
            return container;
        }
    };
};
