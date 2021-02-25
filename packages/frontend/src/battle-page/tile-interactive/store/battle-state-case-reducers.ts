import { GameCaseReducers } from '../../../store/game-case-reducers';
import { assertBattleState } from '../../store/assert-battle-state';
import { BattleCommitAction, BattleRollbackAction, BattleTimeUpdateAction } from './battle-state-actions';

export const battleStateCaseReducers: GameCaseReducers<'battle'> = {
    [ BattleTimeUpdateAction.type ]: (state, { payload }: BattleTimeUpdateAction) => {
        assertBattleState(state);

        state.currentTime = payload.currentTime;
    },
    [ BattleCommitAction.type ]: (state, { payload }: BattleCommitAction) => {
        assertBattleState(state);

        const { spellAction, futureState } = payload;

        state.spellActions[ spellAction.launchTime ] = spellAction;
        state.spellActionList.push(spellAction.launchTime);

        state.serializableStates[ futureState.time ] = futureState;
        state.serializableStateList.push(futureState.time);
    },
    [BattleRollbackAction.type]: (state, {payload}: BattleRollbackAction) => {
        assertBattleState(state);

        const { lastState } = payload;

        state.spellActionList = state.spellActionList.filter(time => time <= lastState.time);
        state.serializableStateList = state.serializableStateList.filter(time => time <= lastState.time);
    }
};
