import * as PIXI from 'pixi.js';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';

export const RoomStageGraphic: StageGraphicCreator = () => {

    const container = new PIXI.Container();

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Room stage', textStyle);
    container.addChild(text);

    return {
        container
    };
};
