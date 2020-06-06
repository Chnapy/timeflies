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
    selectedSpellId?: string;
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

const calculateGrid = (tiledSchema: TiledMap, charactersPositionList: Position[]): Pick<BattleActionState, 'easyStarGrid' | 'grid'> => {
    const { width, height } = tiledSchema;

    const tiledManager = TiledManager(tiledSchema);

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
            const tileType = tiledManager.getTileType(p);

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
        const { tiledMapAssets, entitiesSnapshot } = payload;

        const charactersPositionList = entitiesSnapshot.charactersSnapshots.map(c => c.position);

        return {
            ...state,
            tiledSchema: payload.tiledMapAssets.schema,
            tiledImagesUrls: payload.tiledMapAssets.imagesUrls,
            charactersPositionList,
            ...calculateGrid(tiledMapAssets.schema, charactersPositionList)
        };
    },
    [ BattleStateTurnStartAction.type ]: (state, { payload }: BattleStateTurnStartAction) => {
        const { currentCharacter } = payload;

        return {
            ...state,
            currentAction: currentCharacter.isMine
                ? 'spellPrepare'
                : 'watch',
            path: [],
            rangeArea: [],
            actionArea: []
        };
    },
    [ BattleStateTurnEndAction.type ]: (state, action: BattleStateTurnEndAction) => {

        return {
            ...state,
            currentAction: 'watch',
            selectedSpellId: undefined,
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
