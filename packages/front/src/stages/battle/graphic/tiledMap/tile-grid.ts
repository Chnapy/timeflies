import TiledMap from 'tiled-types/types';
import { graphicTheme } from '../graphic-theme';
import * as PIXI from 'pixi.js';

const { palette } = graphicTheme;

export const TileGrid = (
    { width, height, tilewidth, tileheight }: Pick<TiledMap, 'width' | 'height' | 'tilewidth' | 'tileheight'>,
    color: number = palette.primary.main
) => {

    const graphic = new PIXI.Graphics();
    graphic.lineStyle(1, color, 0.1);
    for (let y = 0; y < height; y++) {
        graphic.moveTo(0, y * tileheight);
        graphic.lineTo(width * tilewidth, y * tileheight);
    }
    for (let x = 0; x < width; x++) {
        graphic.moveTo(x * tilewidth, 0);
        graphic.lineTo(x * tilewidth, height * tileheight);
    }

    return {
        graphic
    };
};
