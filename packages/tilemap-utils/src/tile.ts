import { TiledMap, TiledTileset, TiledLayerTilelayer, TiledFrame } from 'tiled-types';
import { createPosition, Position } from '@timeflies/common';
import { Layer } from './layer';

export module Tile {

    export type TileType = 'default' | 'obstacle';

    export const getTilePositionFromIndex = (index: number, { width }: Pick<TiledMap, 'width'>): Position => {
        var y = Number.parseInt(index / width + '');
        var x = (index % width);
        return createPosition(x, y);
    };

    export const getWorldPositionFromTilePosition = (
        tilePosition: Position,
        { tilewidth, tileheight }: Pick<TiledTileset, 'tilewidth' | 'tileheight'>,
        layerOffset?: Pick<TiledLayerTilelayer, 'offsetx' | 'offsety'>
    ): Position => {
        const offsetX = layerOffset?.offsetx ?? 0;
        const offsetY = layerOffset?.offsety ?? 0;

        return createPosition(
            tilePosition.x * tilewidth + offsetX,
            tilePosition.y * tileheight + offsetY
        );
    };

    export const getTilesetFromTileId = (tileId: number, { tilesets }: Pick<TiledMap, 'tilesets'>) => {
        return tilesets.find(t => t.firstgid <= tileId && t.firstgid + t.tilecount - 1 >= tileId);
    };

    export const getTileAnimation = (tileId: number, { tiles = [] }: Pick<TiledTileset, 'tiles'>): TiledFrame[] | null => {
        const tileAnimation = tiles[ tileId - 1 ]?.animation;

        if (!tileAnimation?.length) {
            return null;
        }

        return tileAnimation.map(({ tileid, duration }): TiledFrame => ({
            tileid: tileid + 1,
            duration
        }));
    };

    const getTileIdFromPosition = ({ data, width }: TiledLayerTilelayer, { x, y }: Position): number => {
        const index = x + y * width;
        return (data as number[])[ index ];
    };

    const hasTileFromLayer = (layer: TiledLayerTilelayer, position: Position): boolean => {
        return getTileIdFromPosition(layer, position) !== 0;
    };

    export const getTileTypeFromPosition = (position: Position, tiledMap: Pick<TiledMap, 'layers'>): TileType => {

        const obstaclesLayer = Layer.getTilelayer('obstacles', tiledMap);

        if (hasTileFromLayer(obstaclesLayer, position)) {
            return 'obstacle';
        }

        return 'default';
    };
}
