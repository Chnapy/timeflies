import { Position } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { TileTriggerFn } from './TiledMapGraphic';
import { graphicTheme } from '../graphic-theme';
import { requestRender } from '../../../../canvas/GameCanvas';

export interface TileGraphicProps {
    texture: PIXI.Texture;
    tilePos: Position;
    worldPos: Position;
    tilewidth: number;
    tileheight: number;

    /**
     * These functions may change on runtime,
     * so do not extract them from this object on use
     */
    triggerFn: TileTriggerFn;
}

export interface TileGraphic {
    readonly container: PIXI.Container;
    readonly containerOver: PIXI.Container;

    readonly tilePos: Readonly<Position>;

    reset(): void;
    showPath(isLast: boolean): void;
    showRange(): void;
    showAction(inRange: boolean): void;
    persistAction(startTime: number): void;
    persistActionStart(duration: number, startTime: number): void;
    clearPersist(startTime?: number, removed?: boolean): void;
}

export const TileGraphic = ({
    texture, tilePos, worldPos, tilewidth: tilesize, triggerFn
}: TileGraphicProps): TileGraphic => {

    const container = new PIXI.Container();
    container.x = worldPos.x;
    container.y = worldPos.y;
    container.interactive = true;
    container.on('mouseover', () => triggerFn.onTileHover(tilePos, this_));
    container.on('click', (e: PIXI.interaction.InteractionEvent) => {
        // if left-click
        if (e.data.originalEvent.which === 1) {
            triggerFn.onTileClick(tilePos);
        }
    });

    const sprite = PIXI.Sprite.from(texture);
    sprite.width = tilesize;
    sprite.height = tilesize;

    const graphicsUnder = new PIXI.Graphics();
    const graphicsOver = new PIXI.Graphics();
    const graphicsOverPersist = new PIXI.Graphics();
    const graphicsOverPersistStart = new PIXI.Graphics();

    container.addChild(
        sprite,
        graphicsUnder
    );

    const containerOver = new PIXI.Container();
    containerOver.x = worldPos.x;
    containerOver.y = worldPos.y;

    containerOver.addChild(
        graphicsOver,
        graphicsOverPersist,
        graphicsOverPersistStart
    );

    const startTimeList: number[] = [];

    let ticker: PIXI.Ticker | null = null;

    const drawTarget = () => {
        const { palette } = graphicTheme;

        const margin = 4;
        const size = tilesize - margin * 2;
        const length = 12;

        graphicsOver.moveTo(margin, margin + length);
        graphicsOver.lineStyle(4, palette.primary.main);
        graphicsOver.lineTo(margin, margin);
        graphicsOver.lineTo(margin + length, margin);

        graphicsOver.moveTo(margin + size - length, margin);
        graphicsOver.lineTo(margin + size, margin);
        graphicsOver.lineTo(margin + size, margin + length);

        graphicsOver.moveTo(margin + size, margin + size - length);
        graphicsOver.lineTo(margin + size, margin + size);
        graphicsOver.lineTo(margin + size - length, margin + size);

        graphicsOver.moveTo(margin, margin + size - length);
        graphicsOver.lineTo(margin, margin + size);
        graphicsOver.lineTo(margin + length, margin + size);
    };

    const reset = () => {
        sprite.alpha = 0.75;
        graphicsUnder.clear();
        graphicsOver.clear();

        requestRender();
    };

    const showPath = (isLast: boolean) => {
        reset();

        sprite.alpha = 1;

        const { palette } = graphicTheme;

        if (isLast) {

            const margin = tilesize * (3 / 8);
            const size = tilesize / 4;

            graphicsUnder.beginFill(palette.primary.main);
            graphicsUnder.drawRoundedRect(margin, margin, size, size, 2);
            graphicsUnder.endFill();

            const margin2 = tilesize / 4;
            const size2 = tilesize / 2;

            graphicsUnder.beginFill(0, 0);
            graphicsUnder.lineStyle(4, palette.primary.main, undefined, 0);
            graphicsUnder.drawRoundedRect(margin2, margin2, size2, size2, 2);
            graphicsUnder.endFill();

            drawTarget();
        }

        requestRender();
    };

    const showRange = () => {
        reset();

        sprite.alpha = 1;

        requestRender();
    };

    const showAction = (inRange: boolean) => {
        reset();

        if (inRange) {
            sprite.alpha = 1;
        }

        drawTarget();
        
        requestRender();
    };

    const drawTargetCurrent = () => {

        const { palette } = graphicTheme;

        const margin = 20;
        const size = tilesize - margin * 2;
        const length = 6;

        graphicsOverPersist.moveTo(margin, margin + length);
        graphicsOverPersist.lineStyle(4, palette.primary.main);
        graphicsOverPersist.lineTo(margin, margin);
        graphicsOverPersist.lineTo(margin + length, margin);

        graphicsOverPersist.moveTo(margin + size - length, margin);
        graphicsOverPersist.lineTo(margin + size, margin);
        graphicsOverPersist.lineTo(margin + size, margin + length);

        graphicsOverPersist.moveTo(margin + size, margin + size - length);
        graphicsOverPersist.lineTo(margin + size, margin + size);
        graphicsOverPersist.lineTo(margin + size - length, margin + size);

        graphicsOverPersist.moveTo(margin, margin + size - length);
        graphicsOverPersist.lineTo(margin, margin + size);
        graphicsOverPersist.lineTo(margin + length, margin + size);
        graphicsOverPersist.lineStyle();
    };

    const persistAction = (startTime: number) => {
        startTimeList.push(startTime);

        graphicsOverPersist.clear();

        drawTargetCurrent();
        
        requestRender();
    };

    const persistActionStart = (duration: number, startTime: number) => {
        const { palette } = graphicTheme;

        const width = tilesize / 2;
        const height = 6;
        const marginX = tilesize / 4;
        const marginTop = 8;

        const fullBarWidth = width - 2;

        graphicsOverPersist.clear();

        drawTargetCurrent();

        const drawGauge = () => {
            const timeElapsed = Date.now() - startTime;
            const ratio = Math.max(1 - timeElapsed / duration, 0);

            const barWidth = fullBarWidth * ratio;

            graphicsOverPersistStart.clear();

            graphicsOverPersistStart.beginFill(palette.primary.contrastText);
            graphicsOverPersistStart.drawRoundedRect(marginX, marginTop, width, height, 2);
            graphicsOverPersistStart.endFill();

            if (barWidth) {
                graphicsOverPersistStart.beginFill(palette.primary.main);
                graphicsOverPersistStart.drawRoundedRect(marginX + 1, marginTop + 1, barWidth, height - 2, 2);
                graphicsOverPersistStart.endFill();
            }
        
            requestRender();
        };

        drawGauge();

        ticker?.destroy();
        ticker = new PIXI.Ticker();
        ticker.add(() => {
            drawGauge();
        })
            .start();
    };

    const clearPersist = (startTime?: number, removed?: boolean) => {

        ticker?.destroy();
        ticker = null;

        graphicsOverPersistStart.clear();

        if(!startTime) {
            graphicsOverPersist.clear();
            return;
        }

        const index = startTimeList.indexOf(startTime);
        if (index !== -1) {

            startTimeList.splice(index, removed ? Infinity : 1);

            if (!startTimeList.length) {
                graphicsOverPersist.clear();
            }
        }
        
        requestRender();
    };

    const this_: TileGraphic = {
        container,
        containerOver,
        tilePos,
        reset,
        showPath,
        showRange,
        showAction,
        persistAction,
        persistActionStart,
        clearPersist
    };

    reset();

    return this_;
};
