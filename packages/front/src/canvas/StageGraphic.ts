import * as PIXI from 'pixi.js';

export interface StageGraphic {
    readonly container: PIXI.Container;
    onResize?(width: number, height: number): void;
}

export interface StageGraphicCreator {
    (renderer: PIXI.Renderer): StageGraphic;
}
