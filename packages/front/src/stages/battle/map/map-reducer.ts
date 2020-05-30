import { createReducer, createAction } from '@reduxjs/toolkit';
import TiledMap from 'tiled-types/types';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';
import { GlobalTurnSnapshot } from '@timeflies/shared';

// TODO tiledmanager => do orphelin functions

type GridTile = {
    tileNumber: number; // easystar
    position: Position;
};

export type MapState = {
    tiledMapAssets: {
        schema: TiledMap;
        imagesUrls: Record<string, string>;
    } | null;
    // easystar instance => middleware that catch action and return response
    charactersPositionList: Position[];
    grid: GridTile[];
};

// TODO move it
export type BattleStartAction = ReturnType<typeof BattleStartAction>;
export const BattleStartAction = createAction<{
    tiledMapAssets: {
        schema: TiledMap;
        imagesUrls: Record<string, string>;
    };
    charactersPositionList: Position[];
    globalTurnSnapshot: GlobalTurnSnapshot;
}>('battle/start');

const initialState: MapState = {
    tiledMapAssets: null,
    charactersPositionList: [],
    grid: []
};

const calculateGrid = (width: number, height: number, charactersPositionList: Position[]): GridTile[] => {
    return [];
};

export const mapReducer = createReducer(initialState, {
    [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
        const { tiledMapAssets, charactersPositionList } = payload;

        const { width, height } = tiledMapAssets.schema;

        const grid = calculateGrid(width, height, charactersPositionList);

        return {
            tiledMapAssets: payload.tiledMapAssets,
            charactersPositionList,
            grid
        };
    },
    [ BattleCommitAction.type ]: (state, action: BattleCommitAction) => {
        const { width, height } = state.tiledMapAssets!.schema;
        const { charactersPositionList } = state;

        state.grid = calculateGrid(width, height, charactersPositionList);
    },
    [ SpellActionTimerEndAction.type ]: (state, { payload: { removed } }: SpellActionTimerEndAction) => {
        if (removed) {
            const { width, height } = state.tiledMapAssets!.schema;
            const { charactersPositionList } = state;

            state.grid = calculateGrid(width, height, charactersPositionList);
        }
    }

});
