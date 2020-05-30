import { createReducer } from '@reduxjs/toolkit';
import { SpellActionSnapshot } from '@timeflies/shared';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { SpellActionCancelAction, SpellActionLaunchAction, SpellActionTimerEndAction } from './spell-action-actions';

export type SpellActionState = {
    spellActionSnapshotList: SpellActionSnapshot[];
    currentSpellAction: SpellActionSnapshot | null;
};

const initialState: SpellActionState = {
    spellActionSnapshotList: [],
    currentSpellAction: null
};

export const spellActionReducer = createReducer(initialState, {
    [ SpellActionLaunchAction.type ]: (state, { payload: { spellActionSnapshotList } }: SpellActionLaunchAction) => {
        state.spellActionSnapshotList.push(...spellActionSnapshotList);

        if (!state.currentSpellAction) {
            state.currentSpellAction = spellActionSnapshotList[ 0 ];
        }
    },
    [ SpellActionTimerEndAction.type ]: (state, action: SpellActionTimerEndAction) => {
        state.currentSpellAction = null;
    },
    [ BattleStateTurnStartAction.type ]: (state, action: BattleStateTurnStartAction) => {
        state.spellActionSnapshotList = [];
    },
    [ SpellActionCancelAction.type ]: (state, { payload: { spellActionSnapshotsValids } }: SpellActionCancelAction) => {
        state.spellActionSnapshotList = spellActionSnapshotsValids;
        state.currentSpellAction = null;
    }
});
