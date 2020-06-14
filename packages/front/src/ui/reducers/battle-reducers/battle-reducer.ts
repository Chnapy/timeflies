import { combineReducers } from '@reduxjs/toolkit';
import { battleActionReducer, BattleActionState } from '../../../stages/battle/battleState/battle-action-reducer';
import { cycleReducer, CycleState } from '../../../stages/battle/cycle/cycle-reducer';
import { snapshotReducer, SnapshotState } from '../../../stages/battle/snapshot/snapshot-reducer';

export type BattleState = {

    battleActionState: BattleActionState;
    cycleState: CycleState;
    snapshotState: SnapshotState;
};

export const battleReducer = combineReducers<BattleState>({
    battleActionState: battleActionReducer,
    cycleState: cycleReducer,
    snapshotState: snapshotReducer(),
});
