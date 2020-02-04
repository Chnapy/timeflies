import bresenham from 'bresenham';
import fs from 'fs';
import { TiledLayerTilelayer, TiledMapOrthogonal } from 'tiled-types';
import urlJoin from 'url-join';
import { Position } from '../../shared/Character';
import { MapInfos } from "../../shared/MapInfos";

export class BRMap {

    private readonly mapInfos: MapInfos;

    private readonly schema: TiledMapOrthogonal;

    private readonly initLayer: TiledLayerTilelayer;
    private readonly obstaclesLayer: TiledLayerTilelayer;

    readonly initPositions: ReadonlyArray<ReadonlyArray<Position>>;

    constructor(mapInfos: MapInfos) {
        this.mapInfos = mapInfos;

        const { urls: { schema: schemaURL }, initLayerKey, obstaclesLayerKey } = mapInfos;

        const data = fs.readFileSync(urlJoin('public', schemaURL), 'utf8');

        this.schema = JSON.parse(data);

        const initLayer = this.schema.layers.find(l => l.name === initLayerKey);
        if (!initLayer || initLayer.type !== 'tilelayer') {
            throw new Error('init layer type must be tilelayer');
        }
        this.initLayer = initLayer;

        const obstaclesLayer = this.schema.layers.find(l => l.name === obstaclesLayerKey);
        if (!obstaclesLayer || obstaclesLayer.type !== 'tilelayer') {
            throw new Error('obstacle layer type must be tilelayer');
        }
        this.obstaclesLayer = obstaclesLayer;

        this.initPositions = this.getInitPositions();
    }

    getBresenhamLine(start: Position, end: Position): (Position & { d: number })[] {
        const path: Position[] = bresenham(start.x, start.y, end.x, end.y);

        return path.map(p => ({
            ...p,
            d: this.getLayerTile(this.obstaclesLayer, p)
        }));
    }

    private getInitPositions(): Position[][] {

        const { width, data } = this.initLayer;

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
    }

    private getLayerTile({ data, width }: TiledLayerTilelayer, { x, y }: Position): number {
        if (!data) {
            throw new Error('layer must have data');
        }

        return data[ y * width + x ];
    }
}