import { CaseReducer } from '@reduxjs/toolkit';
import { GameState } from '../../../store/game-state';
import { isMyCharacterPlayingSelector } from '../../hooks/use-is-my-character-playing';
import { assertBattleState } from '../../store/assert-battle-state';
import { BattlePrepareTurnStartAction, BattleTurnEndAction } from './cycle-actions';

export const cycleCaseReducers: Record<string, CaseReducer<GameState[ 'battle' ], any>> = {
    [ BattlePrepareTurnStartAction.type ]: (state, { payload }: BattlePrepareTurnStartAction) => {
        assertBattleState(state);

        const { roundIndex, turnIndex, characterId, startTime } = payload;

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
