import { createReducer } from '@reduxjs/toolkit';
import { Normalized, Position } from '@timeflies/shared';
import TiledMap from 'tiled-types/types';
import { BattleStartAction } from '../battle-actions';
import { BattleMapPathAction, BattleStateSpellPrepareAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from './battle-state-actions';

export type BState = 'watch' | 'spellPrepare';

export type BattleActionState = {
    currentAction: BState;
    selectedSpellId?: string;
    tiledSchema: TiledMap | null;
    tiledImagesUrls: Record<string, string>;
    futureCharacterPosition: Position | null;

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
    path: [],
    rangeArea: {},
    actionArea: {}
};

export const ACCEPTABLE_TILES: number[] = [ 0 ];

export const battleActionReducer = createReducer(initialState, {
    [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
        const { tiledMapAssets } = payload;

        return {
            ...state,
            tiledSchema: tiledMapAssets.schema,
            tiledImagesUrls: tiledMapAssets.imagesUrls
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
