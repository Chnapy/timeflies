import { GameCaseReducers } from '../../../store/game-case-reducers';
import { assertBattleState } from '../../store/assert-battle-state';
import { SpellSelectAction } from './spell-select-actions';

export const spellSelectCaseReducers: GameCaseReducers<'battle'> = {
    [ SpellSelectAction.type ]: (state, { payload }: SpellSelectAction) => {
        assertBattleState(state);

        state.selectedSpellId = payload;
    },
};
