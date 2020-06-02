import * as PIXI from 'pixi.js';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';

export const BootStageGraphic: StageGraphicCreator = () => {

    const container = new PIXI.Container();

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Boot stage', textStyle);
    container.addChild(text);

    return {
        container
    };
};
