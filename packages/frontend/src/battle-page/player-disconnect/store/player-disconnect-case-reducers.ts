import { GameCaseReducers } from '../../../store/game-case-reducers';
import { BattlePlayerDisconnectAction, BattlePlayerDisconnectRemoveAction } from './player-disconnect-actions';

export const playerDisconnectCaseReducers: GameCaseReducers<'battle'> = {
    [ BattlePlayerDisconnectAction.type ]: (state, { payload }: BattlePlayerDisconnectAction) => {
        if (!state) {
            return;
        }

        const { playerId } = payload;

        state.playerDisconnectedList.push(playerId);
    },
    [ BattlePlayerDisconnectRemoveAction.type ]: (state, { payload }: BattlePlayerDisconnectRemoveAction) => {
        if (!state) {
            return;
        }

        const { newState } = payload;

        state.serializableStates[ newState.time ] = newState;
        state.serializableStateList.push(newState.time);
        state.currentTime = newState.time;
    }
};
