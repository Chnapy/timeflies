import { ArrayUtils } from '@timeflies/common';
import { GameCaseReducers } from '../../../store/game-case-reducers';
import { isMyCharacterPlayingSelector } from '../../hooks/use-is-my-character-playing';
import { assertBattleState } from '../../store/assert-battle-state';
import { BattlePrepareTurnStartAction, BattleTurnEndAction } from './cycle-actions';

export const cycleCaseReducers: GameCaseReducers<'battle'> = {
    [ BattlePrepareTurnStartAction.type ]: (state, { payload }: BattlePrepareTurnStartAction) => {
        assertBattleState(state);

        const { roundIndex, turnIndex, characterId, startTime } = payload;

        state.spellActionEffects = {};
        state.spellActionEffectList = [];

        state.serializableStateList
            .slice(0, state.serializableStateList.length - 1)
            .forEach(time => {
                delete state.serializableStates[ time ];
            });
        state.serializableStateList = [ ArrayUtils.last(state.serializableStateList)! ];

        state.roundIndex = roundIndex;
        state.turnIndex = turnIndex;
        state.playingCharacterId = characterId;
        state.turnStartTime = startTime;

        const isMyCharacterPlaying = isMyCharacterPlayingSelector(state);

        const { defaultSpellId } = state.staticCharacters[ payload.characterId ];

        state.selectedSpellId = isMyCharacterPlaying ? defaultSpellId : null;
    },
    [ BattleTurnEndAction.type ]: (state, action) => {
        assertBattleState(state);

        state.selectedSpellId = null;
    },
};
