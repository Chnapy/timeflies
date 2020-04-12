import { TiledLayerTilelayer, TiledMap, TiledMapOrthogonal, TiledMapType, TiledTileset } from 'tiled-types';
import { MapConfig } from './MapConfig';
import { Position } from '../geo';
import { assertIsDefined } from '../util';

type TiledLayerTilelayerWithData = Omit<TiledLayerTilelayer, 'data'>
    & Pick<Required<TiledLayerTilelayer>, 'data'>;

export interface TiledManager {
    readonly orientation: TiledMapType;
    readonly width: number;
    readonly height: number;

    readonly assets: TiledMapAssets;

    getTileType(position: Position): TileType;
    getTilePositionFromIndex(index: number): Position;
    getTilesetFromId(id: number): TiledTileset | undefined;

    getRangeArea(center: Position, r: number): Position[];
    getActionArea(center: Position, r: number): Position[];
}

export type TileType = 'default' | 'obstacle' | null;

export type TiledManagerConfig = Pick<MapConfig, 'defaultTilelayerName' | 'obstacleTilelayerName'>;

export type TiledMapAssets = {
    schema: TiledMap;
    images: Record<string, HTMLImageElement>;
};

function assertMapIsAllowed(map: TiledMap): asserts map is TiledMapOrthogonal {
    if (map.orientation !== 'orthogonal') {
        throw new Error(`The given map should be orthogonal, but is [${map.orientation}]`);
    }
};

export const TiledManager = (
    assets: TiledMapAssets,
    { defaultTilelayerName, obstacleTilelayerName }: TiledManagerConfig
): TiledManager => {
    const { schema } = assets;

    const getTilelayer = (name: string): TiledLayerTilelayerWithData => {
        const layer = schema.layers.find((layer): layer is TiledLayerTilelayer =>
            layer.type === 'tilelayer' && layer.name === name
        );
        assertIsDefined(layer);
        assertIsDefined(layer.data);

        return layer as TiledLayerTilelayerWithData;
    };

    assertMapIsAllowed(schema);

    const { orientation, width, height } = schema;

    const defaultTilelayer = getTilelayer(defaultTilelayerName);
    const obstacleTilelayer = getTilelayer(obstacleTilelayerName);

    const getTilePositionFromIndex = (index: number): Position => {
        const y = Number.parseInt(index / width + '');
        const x = (index % width);
        return { x, y };
    };

    const getTileIdFromPosition = ({ data, width }: TiledLayerTilelayerWithData, { x, y }: Position): number => {
        const index = x + y * width;
        return data[ index ];
    };

    const hasTileFromLayer = (layer: TiledLayerTilelayerWithData, position: Position): boolean => {
        return getTileIdFromPosition(layer, position) !== 0;
    };

    const getTileType = (position: Position): TileType => {

        if (hasTileFromLayer(obstacleTilelayer, position)) return 'obstacle';

        if (hasTileFromLayer(defaultTilelayer, position)) return 'default';

        return null;
    };

    const getTilesetFromId = (id: number): TiledTileset | undefined =>
        schema.tilesets.find(t => t.firstgid <= id && t.firstgid + t.tilecount - 1 >= id);

    // TODO check vision lines with bresenham
    const getRangeArea = (center: Position, r: number): Position[] => {

        const area: Position[] = [];
        let sum = 0;
        for (let i = 0; i <= r * 2; i++) {
            for (let k = 0; k <= (i - sum) * 2; k++) {

                const pos: Position = {
                    x: center.x - i + sum + k,
                    y: center.y - r + i
                };

                if (getTileType(pos) === 'default') {
                    area.push(pos);
                }
            }

            if (i >= r) {
                sum += 2;
            }
        }
        return area;
    };

    return {
        orientation,
        width,
        height,

        assets,

        getTilePositionFromIndex,
        getTileType,
        getTilesetFromId,

        getRangeArea,
        getActionArea: getRangeArea
    };
}
