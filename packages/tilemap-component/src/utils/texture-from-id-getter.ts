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

        const idIndex = id - tileset.firstgid;
        const { x, y } = Tile.getWorldPositionFromTilePosition(
            Tile.getTilePositionFromTileset(idIndex, tileset),
            tileset
        );

        const texture = new PIXI.Texture(
            tilesetTexture.baseTexture,
            new PIXI.Rectangle(x, y, tileset.tilewidth, tileset.tileheight)
        );
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        return texture;
    });
};
