import { CaseReducer } from '@reduxjs/toolkit';
import { GameState } from '../../../store/game-state';
import { assertBattleState } from '../../store/assert-battle-state';
import { BattlePrepareTurnStartAction } from './cycle-actions';

export const cycleCaseReducers: Record<string, CaseReducer<GameState[ 'battle' ], any>> = {
    [ BattlePrepareTurnStartAction.type ]: (state, { payload }: BattlePrepareTurnStartAction) => {
        assertBattleState(state);
        
        const { roundIndex, turnIndex, characterId, startTime } = payload;

        state.roundIndex = roundIndex;
        state.turnIndex = turnIndex;
        state.playingCharacterId = characterId;
        state.turnStartTime = startTime;
    },
};
