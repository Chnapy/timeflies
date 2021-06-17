import { GameCaseReducers } from '../../../store/game-case-reducers';
import { SpellSelectAction } from './spell-select-actions';

export const spellSelectCaseReducers: GameCaseReducers<'battle'> = {
    [ SpellSelectAction.type ]: (state, { payload }: SpellSelectAction) => {
        if (!state) {
            return;
        }

        state.selectedSpellId = payload;
    },
};
