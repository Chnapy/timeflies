import { createCache } from '@timeflies/cache';
import { CharacterId, CharacterVariablesMap, createPosition, Normalized, Position } from '@timeflies/common';
import bresenham from 'bresenham';
import EasyStar from 'easystarjs';
import { TiledMap } from 'tiled-types';
import { Tile } from './tile';

export module Area {

    export type GridTile = Position & {
        tileType: Tile.TileType;
    };

    export type BresenhamPoint = {
        position: Position;
        tileType: Tile.TileType;
    };

    export const getMapGrid = (tiledMap: Pick<TiledMap, 'layers' | 'width' | 'height'>): Normalized<GridTile> => {

        const grid: Normalized<GridTile> = {};

        for (let y = 0; y < tiledMap.height; y++) {
            for (let x = 0; x < tiledMap.width; x++) {
                const p = createPosition(x, y);
                const tileType = Tile.getTileTypeFromPosition(p, tiledMap);

                grid[ p.id ] = {
                    ...p,
                    tileType
                };
            }
        }

        return grid;
    };

    export const getArea = (center: Position, r: number, tiledMap: Pick<TiledMap, 'layers'>): Position[] => {

        const area: Position[] = [];
        let sum = 0;
        for (let i = 0; i <= r * 2; i++) {
            for (let k = 0; k <= (i - sum) * 2; k++) {

                const pos = createPosition(
                    center.x - i + sum + k,
                    center.y - r + i
                );

                if (Tile.getTileTypeFromPosition(pos, tiledMap) === 'default') {
                    area.push(pos);
                }
            }

            if (i >= r) {
                sum += 2;
            }
        }
        return area;
    };

    export const getBresenhamLine = (start: Position, end: Position, tiledMap: Pick<TiledMap, 'layers'>): BresenhamPoint[] => {

        const path = bresenham(start.x, start.y, end.x, end.y);

        return path
            .map(({ x, y }) => createPosition(x, y))
            .map((position): BresenhamPoint => ({
                position,
                tileType: Tile.getTileTypeFromPosition(position, tiledMap)
            }));
    };

    export const getPathfinderInstance = () => {
        const pathfinder = new EasyStar.js();

        const acceptableTiles = [ 0 ];

        // cache grid calculation
        const gridCache = createCache<CharacterVariablesMap[ 'position' ], null>();

        const computePathfinderGrid = (tiledMap: TiledMap, characterAliveList: CharacterId[], charactersPositions: CharacterVariablesMap[ 'position' ]) => {
            const characterPositionsSet = new Set(
                characterAliveList.map(characterId => charactersPositions[ characterId ].id)
            );

            const getTileID = (p: Position): number => {
                const obstacle = Tile.getTileTypeFromPosition(p, tiledMap) === 'obstacle'
                    || characterPositionsSet.has(p.id);

                return obstacle ? 1 : acceptableTiles[ 0 ];
            };

            const pathfinderGrid: number[][] = [];

            for (let y = 0; y < tiledMap.height; y++) {
                pathfinderGrid[ y ] = [];
                for (let x = 0; x < tiledMap.width; x++) {
                    const p = createPosition(x, y);

                    pathfinderGrid[ y ][ x ] = getTileID(p);
                }
            }

            return pathfinderGrid;
        };

        const refreshGridIfNeeded = (tiledMap: TiledMap, characterAliveList: CharacterId[], charactersPositions: CharacterVariablesMap[ 'position' ]) => {
            gridCache.getOrElse(charactersPositions, () => {
                gridCache.clear();

                pathfinder.setGrid(
                    computePathfinderGrid(tiledMap, characterAliveList, charactersPositions)
                );
                pathfinder.setAcceptableTiles(acceptableTiles);

                return null;
            });
        };

        const calculatePath = (
            tiledMap: TiledMap, characterAliveList: CharacterId[], charactersPositions: CharacterVariablesMap[ 'position' ],
            { x: startX, y: startY }: Position, { x: endX, y: endY }: Position
        ) => new Promise<Position[]>(resolve => {
            refreshGridIfNeeded(tiledMap, characterAliveList, charactersPositions);

            pathfinder.findPath(startX, startY, endX, endY, path => {
                resolve((path ?? []).map(({ x, y }) => createPosition(x, y)));
            });
            pathfinder.calculate();
        });

        return {
            calculatePath
        };
    };
}
