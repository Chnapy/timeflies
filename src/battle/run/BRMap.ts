import fs from 'fs';
import path from 'path';
import { MapInfos } from "../../shared/MapInfos";
import { TiledMapOrthogonal, TiledLayerTilelayer } from 'tiled-types';
import { Position } from '../../shared/Character';

export class BRMap {

    private readonly mapInfos: MapInfos;

    private readonly schema: TiledMapOrthogonal;

    private readonly initLayer: TiledLayerTilelayer;
    private readonly obstaclesLayer: TiledLayerTilelayer;

    readonly initPositions: ReadonlyArray<ReadonlyArray<Position>>;

    constructor(mapInfos: MapInfos) {
        this.mapInfos = mapInfos;

        const { urls: { schema: schemaURL }, initLayerKey, obstaclesLayerKey } = mapInfos;

        const data = fs.readFileSync(path.join('./public', schemaURL), 'utf8');

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

    private getInitPositions(): Position[][] {

        const { width, data } = this.initLayer;

        if (!data) {
            throw new Error('init layer must have data');
        }

        const mapPos: { [k: number]: Position[]; } = {};

        let x, y;
        for (let i = 0; i < data.length; i++) {

            if (!data[i])
                continue;

            x = Math.floor(i / width);
            y = i % width;

            if (!mapPos[data[i]])
                mapPos[data[i]] = [];

            mapPos[data[i]].push({ x, y });
        }

        return Object.values(mapPos);
    }
}