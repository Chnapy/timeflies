import { createReducer } from '@reduxjs/toolkit';
import { equals, Position, TiledManager, TileType } from '@timeflies/shared';
import TiledMap from 'tiled-types/types';
import { BattleStartAction } from '../battle-actions';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { BattleMapPathAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from './battle-state-actions';

export type BState = 'watch' | 'spellPrepare';

export type GridTile = {
    position: Position;
    tileType: TileType;
};

export type BattleActionState = {
    currentAction: BState;
    tiledSchema: TiledMap | null;
    tiledImagesUrls: Record<string, string>;
    charactersPositionList: Position[];
    easyStarGrid: number[][];
    grid: GridTile[];
    path: Position[];
    rangeArea: Position[];
    actionArea: Position[];
};

const initialState: BattleActionState = {
    currentAction: 'watch',
    tiledSchema: null,
    tiledImagesUrls: {},
    charactersPositionList: [],
    easyStarGrid: [],
    grid: [],
    path: [],
    rangeArea: [],
    actionArea: []
};

export const ACCEPTABLE_TILES: number[] = [ 0 ];

export const getArea = (tiledSchema: TiledMap, center: Position, r: number) => TiledManager({
    schema: tiledSchema
} as any).getArea(center, r);

const getTileType = (tiledSchema: TiledMap, p: Position) => TiledManager({
    schema: tiledSchema
} as any).getTileType(p);

const calculateGrid = (tiledSchema: TiledMap, charactersPositionList: Position[]): Pick<BattleActionState, 'easyStarGrid' | 'grid'> => {
    const { width, height } = tiledSchema;

    const getTileID = (p: Position, tileType: TileType): number => {
        const obstacle = tileType === 'obstacle'
            || isSomeoneAtXY(p);

        return obstacle ? 1 : ACCEPTABLE_TILES[ 0 ];
    };

    const isSomeoneAtXY = (p: Position): boolean => {
        return charactersPositionList.some(equals(p));
    };

    const easyStarGrid: number[][] = [];
    const grid: GridTile[] = [];

    for (let y = 0; y < height; y++) {
        easyStarGrid[ y ] = [];
        for (let x = 0; x < width; x++) {
            const p: Position = { x, y };
            const tileType = getTileType(tiledSchema, p);

            grid.push({
                position: p,
                tileType
            });
            easyStarGrid[ y ][ x ] = getTileID(p, tileType);
        }
    }

    return {
        easyStarGrid,
        grid
    };
};

export const battleActionReducer = createReducer(initialState, {
    [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
        const { tiledMapAssets, charactersPositionList } = payload;

        return {
            ...state,
            tiledSchema: payload.tiledMapAssets.schema,
            tiledImagesUrls: payload.tiledMapAssets.imagesUrls,
            charactersPositionList,
            ...calculateGrid(tiledMapAssets.schema, charactersPositionList)
        };
    },
    [ BattleStateTurnStartAction.type ]: (state, { payload }: BattleStateTurnStartAction) => {

        return {
            ...state,
            currentAction: payload.isMine
                ? 'spellPrepare'
                : 'watch',
            path: [],
            rangeArea: [],
            actionArea: []
        };
    },
    [ BattleStateTurnEndAction.type ]: (state, action: BattleStateTurnStartAction) => {

        return {
            ...state,
            currentAction: 'watch',
            path: [],
            rangeArea: [],
            actionArea: []
        };
    },
    [ BattleMapPathAction.type ]: (state, { payload }: BattleMapPathAction) => {

        return {
            ...state,
            ...payload
        };
    },
    [ BattleCommitAction.type ]: (state, { payload }: BattleCommitAction) => {

        const { charactersPositionList } = payload;

        return {
            ...state,
            charactersPositionList,
            ...calculateGrid(state.tiledSchema!, state.charactersPositionList)
        };
    },
});
