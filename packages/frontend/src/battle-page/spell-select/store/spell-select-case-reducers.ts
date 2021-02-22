import { CaseReducer } from '@reduxjs/toolkit';
import { GameState } from '../../../store/game-state';
import { assertBattleState } from '../../store/assert-battle-state';
import { SpellSelectAction } from './spell-select-actions';

export const spellSelectCaseReducers: Record<string, CaseReducer<GameState[ 'battle' ], any>> = {
    [ SpellSelectAction.type ]: (state, { payload }: SpellSelectAction) => {
        assertBattleState(state);

        state.selectedSpellId = payload;
    },
};
