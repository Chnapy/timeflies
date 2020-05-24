import * as PIXI from 'pixi.js';
import { CanvasContextKey, CanvasContextMap } from './CanvasContext';

export interface StageGraphic<K extends CanvasContextKey> {
    onCreate(contextMap: Pick<CanvasContextMap, K>): void;
    onResize?(width: number, height: number): void;
    getContainer(): PIXI.Container;
}

export interface StageGraphicCreator<K extends CanvasContextKey> {
    (renderer: PIXI.Renderer): StageGraphic<K>;
}
