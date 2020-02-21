import { equals, Position } from '@timeflies/shared';
import EasyStar from 'easystarjs';

export interface PathPromise {
    promise: Promise<Position[]>;
    cancel: () => boolean;
}

export interface PathfinderMapUtils {
    tilemap: {
        width: number;
        height: number;
    };
    hasObstacleAt: (p: Position) => boolean;
}

export interface Pathfinder extends ReturnType<typeof Pathfinder> { }

const ACCEPTABLE_TILES: number[] = [ 0 ];

export const Pathfinder = (
    { tilemap, hasObstacleAt }: PathfinderMapUtils,
    getCharactersPosition: () => Readonly<Position>[]
) => {

    const finder = new EasyStar.js();

    let charactersPositions: Position[];

    const getTileID = (p: Position): number => {
        const obstacle = hasObstacleAt(p)
            || isSomeoneAtXY(p);

        return obstacle ? 1 : 0;
    };

    const isSomeoneAtXY = (p: Position): boolean => {
        return charactersPositions.some(equals(p));
    };

    return {

        refreshGrid(): void {

            const { width, height } = tilemap;

            charactersPositions = getCharactersPosition();

            const grid: number[][] = [];
            for (let y = 0; y < height; y++) {
                grid[ y ] = [];
                for (let x = 0; x < width; x++) {
                    grid[ y ][ x ] = getTileID({ x, y });
                }
            }

            finder.setGrid(grid);

            finder.setAcceptableTiles(ACCEPTABLE_TILES);
        },

        calculatePath(
            { x: startX, y: startY }: Position,
            { x: endX, y: endY }: Position
        ): PathPromise {
            
            let instanceId;
            const promise: PathPromise[ 'promise' ] = new Promise(resolve => {

                instanceId = finder.findPath(startX, startY, endX, endY, path => {
                    resolve(path || []);
                });
                finder.calculate();

            });

            const cancel = () => finder.cancelPath(instanceId);

            return {
                promise,
                cancel
            };
        }
    };
};
