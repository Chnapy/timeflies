import * as PIXI from 'pixi.js';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';

export const LoadStageGraphic: StageGraphicCreator<never> = () => {

    const container = new PIXI.Container();

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Load stage', textStyle);
    container.addChild(text);

    return {
        onCreate(contextMap) {

        },
        getContainer() {
            return container;
        }
    };
};
