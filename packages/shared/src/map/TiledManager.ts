import bresenham from 'bresenham';
import { TiledLayerTilelayer, TiledMap, TiledMapOrthogonal, TiledMapType, TiledTileset } from 'tiled-types';
import { Position } from '../geo';
import { assertIsDefined } from '../util';
import { MapConfig } from './MapConfig';

type TiledLayerTilelayerWithData = Omit<TiledLayerTilelayer, 'data'>
    & Pick<Required<TiledLayerTilelayer>, 'data'>;

export interface TiledManager {
    readonly orientation: TiledMapType;
    readonly width: number;
    readonly height: number;

    readonly assets: TiledMapAssets;

    getRenderableLayer(): TiledLayerTilelayer;

    getTileType(position: Position): TileType;
    getTilePositionFromIndex(index: number): Position;
    getTilesetFromId(id: number): TiledTileset | undefined;

    getArea(center: Position, r: number): Position[];
    getBresenhamLine(start: Position, end: Position): BresenhamPoint[];
}

export type TileType = 'default' | 'obstacle' | null;

export type TiledManagerConfig = Pick<MapConfig, 'defaultTilelayerName' | 'obstacleTilelayerName'>;

export type TiledMapAssets = {
    schema: TiledMap;
    images: Record<string, HTMLImageElement>;
};

export interface BresenhamPoint {
    position: Position;
    tileType: TileType;
}

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

    const getRenderableLayer = () => defaultTilelayer;

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

    const getArea = (center: Position, r: number): Position[] => {

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

    const getBresenhamLine = (start: Position, end: Position): BresenhamPoint[] => {

        const path: Position[] = bresenham(start.x, start.y, end.x, end.y);

        return path.map((position): BresenhamPoint => ({
            position,
            tileType: getTileType(position)
        }));
    };

    return {
        orientation,
        width,
        height,

        assets,

        getRenderableLayer,

        getTilePositionFromIndex,
        getTileType,
        getTilesetFromId,

        getArea,
        getBresenhamLine
    };
}
