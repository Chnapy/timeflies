import { Tile } from '@timeflies/tilemap-utils';
import TiledMap, { TiledLayerTilelayer } from 'tiled-types';

export const tileInfosGetter = ({ mapSheet, layer }: {
    mapSheet: TiledMap;
    layer: TiledLayerTilelayer;
}) => {

    return (id: number, index: number) => {

        const tileset = Tile.getTilesetFromTileId(id, mapSheet);
        if (!tileset) {
            return null;
        }

        const tilePos = Tile.getTilePositionFromIndex(index, mapSheet);
        const worldPos = Tile.getWorldPositionFromTilePosition(tilePos, tileset, layer);

        return { tileset, tilePos, worldPos };
    };
};
