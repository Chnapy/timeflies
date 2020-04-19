import { MapConfig, Position } from '@timeflies/shared';
import bresenham from 'bresenham';
import _fs from 'fs';
import { TiledLayerTilelayer, TiledMapOrthogonal } from 'tiled-types';
import urlJoin from 'url-join';

export interface MapManager {
    readonly initPositions: ReadonlyArray<ReadonlyArray<Position>>;
    getBresenhamLine(start: Position, end: Position): (Position & { d: number })[];
}

interface Dependencies {
    fs: Pick<typeof _fs, 'readFileSync'>;
}

export const MapManager = (mapConfig: MapConfig, { fs }: Dependencies = { fs: _fs }): MapManager => {

    const { schemaUrl, obstacleTilelayerName, initLayerName } = mapConfig;

    const data = fs.readFileSync(urlJoin('public', schemaUrl), 'utf8');

    const schema: TiledMapOrthogonal = JSON.parse(data);

    const initLayer = schema.layers.find(l => l.name === initLayerName);
    if (!initLayer || initLayer.type !== 'tilelayer') {
        throw new Error('init layer type must be tilelayer');
    }

    const obstaclesLayer = schema.layers.find(l => l.name === obstacleTilelayerName);
    if (!obstaclesLayer || obstaclesLayer.type !== 'tilelayer') {
        throw new Error('obstacle layer type must be tilelayer');
    }

    const getBresenhamLine = (start: Position, end: Position): (Position & { d: number })[] => {
        const path: Position[] = bresenham(start.x, start.y, end.x, end.y);

        return path.map(p => ({
            ...p,
            d: getLayerTile(obstaclesLayer, p)
        }));
    };

    const getInitPositions = (): Position[][] => {

        const { width, data } = initLayer;

        if (!data) {
            throw new Error('init layer must have data');
        }

        const mapPos: { [ k: number ]: Position[]; } = {};

        let x, y;
        for (let i = 0; i < data.length; i++) {

            if (!data[ i ])
                continue;

            y = Math.floor(i / width);
            x = i % width;

            if (!mapPos[ data[ i ] ])
                mapPos[ data[ i ] ] = [];

            mapPos[ data[ i ] ].push({ x, y });
        }

        return Object.values(mapPos);
    };

    const getLayerTile = ({ data, width }: TiledLayerTilelayer, { x, y }: Position): number => {
        if (!data) {
            throw new Error('layer must have data');
        }

        return data[ y * width + x ];
    };

    const initPositions: ReadonlyArray<ReadonlyArray<Position>> = getInitPositions();

    return {
        initPositions,
        getBresenhamLine
    };
};
