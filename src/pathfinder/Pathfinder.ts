import * as _EasyStar from 'easystarjs';
import { MapComponent } from '../map/Map';

// workaround because of bad import
const EasyStar = _EasyStar[ 'default' ] as typeof _EasyStar;

export interface PathPromise {
    promise: Promise<{ x: number; y: number; }[]>;
    cancel: () => boolean;
}

export class Pathfinder {

    private static ACCEPTABLE_TILES: number[] = [ 0 ];

    private readonly map: MapComponent;
    private readonly finder: InstanceType<(typeof EasyStar)[ 'js' ]>;

    constructor(map: MapComponent) {
        this.map = map;
        this.finder = new EasyStar.js();
    }

    private readonly getTileID = (obstaclesLayer: Phaser.Tilemaps.StaticTilemapLayer, x: number, y: number): number => {
        const obstacle = obstaclesLayer.getTileAt(x, y);
        return obstacle ? 1 : 0;
    };

    setGrid(): this {

        const { tilemap, obstaclesLayer } = this.map;
        const { width, height } = tilemap;

        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
            grid[ y ] = [];
            for (let x = 0; x < width; x++) {
                grid[ y ][ x ] = this.getTileID(obstaclesLayer, x, y);
            }
        }

        console.log(grid);

        this.finder.setGrid(grid);

        this.finder.setAcceptableTiles(Pathfinder.ACCEPTABLE_TILES);

        return this;
    }

    calculatePath(
        startX: number, startY: number,
        endX: number, endY: number
    ): PathPromise {
        let instanceId;
        const promise: PathPromise[ 'promise' ] = new Promise(r => {

            instanceId = this.finder.findPath(startX, startY, endX, endY, path => {
                console.log('P', path);
                r(path || []);
            });
            this.finder.calculate();

        });

        const cancel = () => this.finder.cancelPath(instanceId);

        return {
            promise,
            cancel
        };
    }

}
