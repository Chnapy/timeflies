import * as PIXI from 'pixi.js';
import { serviceEvent } from '../services/serviceEvent';
import { StageChangeGraphicAction } from '../stages/StageManager';

export interface GameCanvas {
}

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement): GameCanvas => {

    const canvas = new PIXI.Application({
        view,
        resizeTo: parent
    });

    // canvas.loader.add(sample).load((_, resources) => {
    //     console.log(resources);
    //     const sprite = new PIXI.Sprite(PIXI.Texture.from(resources[sample]!.data));
    //     canvas.stage.addChild(sprite);
    //     canvas.stage.removeChildren();
    // })

    const { onAction } = serviceEvent();

    onAction<StageChangeGraphicAction>('stage/change/graphic', ({ stageGraphic }) => {
        canvas.stage.removeChildren();
        canvas.stage.addChild(stageGraphic.getContainer());
    });

    return {};
};
