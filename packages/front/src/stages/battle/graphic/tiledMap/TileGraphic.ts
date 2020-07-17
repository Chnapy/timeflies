import { Position } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { TileClickAction, TileHoverAction } from '../../battleState/battle-state-actions';
import { graphicTheme } from '../graphic-theme';

export interface TileGraphicProps {
    texture: PIXI.Texture;
    tilePos: Position;
    worldPos: Position;
    tilewidth: number;
    tileheight: number;
}

export interface TileGraphic {
    id: string;
    readonly container: PIXI.Container;
    readonly containerOver: PIXI.Container;

    readonly tilePos: Readonly<Position>;

    reset(): void;
    showPath(isLast: boolean): void;
    showRange(): void;
    showAction(inRange: boolean): void;
    persistAction(): void;
    persistActionStart(duration: number, startTime: number): void;
    clearPersist(): void;
}

export const TileGraphic = ({
    texture, tilePos, worldPos, tilewidth: tilesize
}: TileGraphicProps): TileGraphic => {

    const { storeEmitter, viewportListener } = CanvasContext.consumer('storeEmitter', 'viewportListener');

    const container = new PIXI.Container();
    container.x = worldPos.x;
    container.y = worldPos.y;
    container.interactive = true;

    container.on('mouseover', (e) => {
        // if no click
        if (e.data.originalEvent.buttons === 0) {
            return storeEmitter.dispatch(TileHoverAction({
                position: tilePos
            }));
        }
    });

    container.on('click', (e: PIXI.interaction.InteractionEvent) => {
        // if left-click
        if (e.data.originalEvent.which === 1) {
            return storeEmitter.dispatch(TileClickAction({
                position: tilePos
            }));
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

    let ticker: PIXI.Ticker | null = null;

    const drawTarget = () => {
        const { palette } = graphicTheme;

        const margin = 1;
        const size = tilesize - margin * 2;
        const length = 4;

        graphicsOver.moveTo(margin, margin + length);
        graphicsOver.lineStyle(2, palette.primary.main);
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
    };

    const showPath = (isLast: boolean) => {
        reset();

        sprite.alpha = 1;

        const { palette } = graphicTheme;

        if (isLast) {

            const margin = tilesize * (3 / 8);
            const size = tilesize / 4;

            graphicsUnder.beginFill(palette.primary.main);
            graphicsUnder.drawRect(margin, margin, size, size);
            graphicsUnder.endFill();

            drawTarget();
        }
    };

    const showRange = () => {
        reset();

        sprite.alpha = 1;
    };

    const showAction = (inRange: boolean) => {
        reset();

        if (inRange) {
            sprite.alpha = 1;
        }

        drawTarget();
    };

    const drawTargetCurrent = () => {

        const { palette } = graphicTheme;

        const margin = 5;
        const size = tilesize - margin * 2;
        const length = 2;

        graphicsOverPersist.moveTo(margin, margin + length);
        graphicsOverPersist.lineStyle(2, palette.primary.main);
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

    const persistAction = () => {
        graphicsOverPersist.clear();

        drawTargetCurrent();
    };

    const persistActionStart = (duration: number, startTime: number) => {
        const { palette } = graphicTheme;

        graphicsOverPersist.clear();

        drawTargetCurrent();

        const drawGauge = () => {
            const scaleValue = viewportListener.getCurrentScale();
            const scaleInverted = 1 / scaleValue;

            const borderSize = 1 * scaleInverted;

            const width = tilesize / 2;
            const height = 6 * scaleInverted;
            const marginX = tilesize / 4;
            const marginTop = 8 * scaleInverted;

            const fullBarWidth = width - 2;

            const timeElapsed = Date.now() - startTime;
            const ratio = Math.max(1 - timeElapsed / duration, 0);

            const barWidth = fullBarWidth * ratio;

            graphicsOverPersistStart.clear();

            graphicsOverPersistStart.beginFill(palette.primary.contrastText);
            graphicsOverPersistStart.drawRect(marginX, marginTop, width, height);
            graphicsOverPersistStart.endFill();

            if (barWidth) {
                graphicsOverPersistStart.beginFill(palette.primary.main);
                graphicsOverPersistStart.drawRect(marginX + borderSize, marginTop + borderSize, barWidth, height - borderSize * 2);
                graphicsOverPersistStart.endFill();
            }
        };

        drawGauge();

        ticker?.destroy();
        ticker = new PIXI.Ticker();
        ticker.add(() => {
            drawGauge();
        })
            .start();
    };

    const clearPersist = () => {

        ticker?.destroy();
        ticker = null;

        graphicsOverPersistStart.clear();

        graphicsOverPersist.clear();
    };

    const this_: TileGraphic = {
        id: tilePos.id,
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

    storeEmitter.onStateChange(
        ({ battle: { battleActionState } }) => {

            const pathIndex = battleActionState.path.findIndex(p => p.id === tilePos.id);

            const path = pathIndex !== -1;

            const pathLastPos = path && (pathIndex === battleActionState.path.length - 1);

            return {
                path,
                pathLastPos,
                rangeArea: !!battleActionState.rangeArea[ tilePos.id ],
                actionArea: !!battleActionState.actionArea[ tilePos.id ],
            };
        },
        ({ path, pathLastPos, rangeArea, actionArea }) => {
            reset();

            if (rangeArea) {
                showRange();
            }

            if (path) {
                showPath(pathLastPos);
            }

            if (actionArea) {
                showAction(rangeArea);
            }
        },
        shallowEqual
    );

    storeEmitter.onStateChange(
        ({ battle: { snapshotState } }) => snapshotState.spellActionSnapshotList.some(s =>
            s.startTime + s.duration > Date.now()
            && !!s.actionArea[ tilePos.id ]),
        futureAction => {
            if (futureAction) {
                persistAction();
            } else {
                clearPersist();
            }
        },
        shallowEqual
    );

    return this_;
};
