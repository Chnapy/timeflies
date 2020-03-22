import { TiledLayerTilelayer, TiledMap, TiledMapOrthogonal, TiledMapType } from 'tiled-types';
import { Position } from '../snapshot';
import { assertIsDefined } from '../util';

type TiledLayerTilelayerWithData = Omit<TiledLayerTilelayer, 'data'>
    & Pick<Required<TiledLayerTilelayer>, 'data'>;

export interface TiledManager {
    readonly orientation: TiledMapType;
    readonly width: number;
    readonly height: number;

    getTileType(position: Position): TileType;
}

export type TileType = 'default' | 'obstacle' | null;

export interface TiledManagerConfig {
    defaultTilelayerName: string;
    obstacleTilelayerName: string;
}

function assertMapIsAllowed(map: TiledMap): asserts map is TiledMapOrthogonal {
    if (map.orientation !== 'orthogonal') {
        throw new Error(`The given map should be orthogonal, but is [${map.orientation}]`);
    }
};

export const TiledManager = (
    map: TiledMap,
    { defaultTilelayerName, obstacleTilelayerName }: TiledManagerConfig
): TiledManager => {

    const getTilelayer = (name: string): TiledLayerTilelayerWithData => {
        const layer = map.layers.find((layer): layer is TiledLayerTilelayer =>
            layer.type === 'tilelayer' && layer.name === name
        );
        assertIsDefined(layer);
        assertIsDefined(layer.data);

        return layer as TiledLayerTilelayerWithData;
    };

    assertMapIsAllowed(map);

    const { orientation, width, height } = map;

    const defaultTilelayer = getTilelayer(defaultTilelayerName);
    const obstacleTilelayer = getTilelayer(obstacleTilelayerName);

    const getTile = ({ data, width }: TiledLayerTilelayerWithData, { x, y }: Position): number => {
        const index = x + y * width;
        return data[ index ];
    };

    const hasTileFromLayer = (layer: TiledLayerTilelayerWithData, position: Position): boolean => {
        return getTile(layer, position) !== 0;
    };

    const getTileType = (position: Position): TileType => {

        if (hasTileFromLayer(obstacleTilelayer, position)) return 'obstacle';

        if (hasTileFromLayer(defaultTilelayer, position)) return 'default';

        return null;
    };

    return {
        orientation,
        width,
        height,

        getTileType
    };
}
