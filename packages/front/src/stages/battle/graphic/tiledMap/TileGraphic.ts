import { Position } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { TileTriggerFn } from './TiledMapGraphic';

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

    readonly tilePos: Readonly<Position>;

    reset(): void;
    showPath(): void;
}

export const TileGraphic = ({
    texture, tilePos, worldPos, tilewidth, tileheight, triggerFn
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
    sprite.width = tilewidth;
    sprite.height = tileheight;

    const graphics = new PIXI.Graphics();

    container.addChild(
        sprite,
        graphics
    );

    const reset = () => {
        graphics.clear();
    };

    const showPath = () => {
        graphics.lineStyle(1, 0x00FF00);
        graphics.beginFill(0x00FF00, 0.1);
        graphics.drawRect(tilewidth / 4, tileheight / 4, tilewidth / 2, tileheight / 2);
        graphics.endFill();
    };

    const this_: TileGraphic = {
        container,
        tilePos,
        reset,
        showPath
    };
    return this_;
};
