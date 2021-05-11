import { Tile } from '@timeflies/tilemap-utils';
import * as PIXI from 'pixi.js';
import TiledMap, { TiledTileset } from 'tiled-types';
import { textureCache } from '../texture-cache';

export const textureFromIdGetter = ({ mapSheet, mapTexture }: {
    mapSheet: TiledMap;
    mapTexture: { [ name: string ]: PIXI.Texture };
}) => {

    return (id: number, tileset: TiledTileset): PIXI.Texture => textureCache.getOrElse(id, () => {

        const tilesetTexture = mapTexture[ tileset.name ];

        const texture = tilesetTexture.clone();

        const idIndex = id - tileset.firstgid;
        const { x, y } = Tile.getWorldPositionFromTilePosition(
            Tile.getTilePositionFromIndex(idIndex, mapSheet),
            tileset
        );

        texture.frame = new PIXI.Rectangle(x, y, tileset.tilewidth, tileset.tileheight);
        texture.updateUvs();
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        return texture;
    });
};
