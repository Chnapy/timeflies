import { combineReducers } from '@reduxjs/toolkit';
import { battleActionReducer, BattleActionState } from '../../../stages/battle/battleState/battle-action-reducer';
import { cycleReducer, CycleState } from '../../../stages/battle/cycle/cycle-reducer';
import { snapshotReducer, SnapshotState } from '../../../stages/battle/snapshot/snapshot-reducer';
import { battleResultsReducer, BattleResultsState } from './battle-results/battle-results-reducer';

export type BattleState = {
    battleActionState: BattleActionState;
    cycleState: CycleState;
    snapshotState: SnapshotState;
    battleResults: BattleResultsState;
};

export const battleReducer = combineReducers<BattleState>({
    battleActionState: battleActionReducer,
    cycleState: cycleReducer,
    snapshotState: snapshotReducer(),
    battleResults: battleResultsReducer
});
