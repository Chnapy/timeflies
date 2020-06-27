import { createReducer } from '@reduxjs/toolkit';
import { createPosition, normalize, Normalized, Position, TiledManager, TileType } from '@timeflies/shared';
import TiledMap from 'tiled-types/types';
import { BattleStartAction } from '../battle-actions';
import { BattleMapPathAction, BattleStateSpellPrepareAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from './battle-state-actions';

export type BState = 'watch' | 'spellPrepare';

export type GridTile = Position & {
    tileType: TileType;
};

export type BattleActionState = {
    currentAction: BState;
    selectedSpellId?: string;
    tiledSchema: TiledMap | null;
    tiledImagesUrls: Record<string, string>;
    futureCharacterPosition: Position | null;
    grid: Normalized<GridTile>;

    // TODO consider normalize
    path: Position[];
    rangeArea: Normalized<Position>;
    actionArea: Normalized<Position>;
};

const initialState: BattleActionState = {
    currentAction: 'watch',
    tiledSchema: null,
    tiledImagesUrls: {},
    futureCharacterPosition: null,
    grid: {},
    path: [],
    rangeArea: {},
    actionArea: {}
};

export const ACCEPTABLE_TILES: number[] = [ 0 ];

const calculateGrid = (tiledSchema: TiledMap): Normalized<GridTile> => {
    const { width, height } = tiledSchema;

    const tiledManager = TiledManager(tiledSchema);

    const grid: GridTile[] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = createPosition(x, y);
            const tileType = tiledManager.getTileType(p);

            grid.push({
                ...p,
                tileType
            });
        }
    }

    return normalize(grid);
};

export const battleActionReducer = createReducer(initialState, {
    [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
        const { tiledMapAssets } = payload;

        return {
            ...state,
            tiledSchema: payload.tiledMapAssets.schema,
            tiledImagesUrls: payload.tiledMapAssets.imagesUrls,
            grid: calculateGrid(tiledMapAssets.schema)
        };
    },
    [ BattleStateTurnStartAction.type ]: (state, { payload }: BattleStateTurnStartAction) => {
        const { currentCharacter } = payload;

        const partialState: Partial<BattleActionState> = currentCharacter.isMine
            ? {
                currentAction: 'spellPrepare',
                selectedSpellId: currentCharacter.defaultSpellId,
                futureCharacterPosition: currentCharacter.position
            }
            : {
                currentAction: 'watch',
                selectedSpellId: undefined,
                futureCharacterPosition: null
            };

        return {
            ...state,
            ...partialState,
            path: [],
            rangeArea: {},
            actionArea: {}
        };
    },
    [ BattleStateTurnEndAction.type ]: (state, action: BattleStateTurnEndAction) => {

        return {
            ...state,
            currentAction: 'watch',
            selectedSpellId: undefined,
            futureCharacterPosition: null,
            path: [],
            rangeArea: {},
            actionArea: {}
        };
    },
    [ BattleStateSpellPrepareAction.type ]: (state, { payload }: BattleStateSpellPrepareAction) => {
        const { futureSpell, futureCharacter } = payload;

        return {
            ...state,
            selectedSpellId: futureSpell ? futureSpell.id : undefined,
            futureCharacterPosition: futureCharacter.position,
            path: [],
            rangeArea: {},
            actionArea: {}
        };
    },
    [ BattleMapPathAction.type ]: (state, { payload }: BattleMapPathAction) => {

        return {
            ...state,
            ...payload
        };
    },
});
