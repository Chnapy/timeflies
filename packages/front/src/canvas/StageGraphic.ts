import { CanvasContextKey, CanvasContextMap } from './CanvasContext';

export interface StageGraphic<K extends CanvasContextKey> {
    onCreate(contextMap: Pick<CanvasContextMap, K>): void;
    getContainer(): PIXI.Container;
}

export interface StageGraphicCreator<K extends CanvasContextKey> {
    (): StageGraphic<K>;
}
