import { combineReducers } from '@reduxjs/toolkit';
import { battleActionReducer, BattleActionState } from '../../../stages/battle/battleState/battle-action-reducer';
import { cycleReducer, CycleState } from '../../../stages/battle/cycle/cycle-reducer';
import { snapshotReducer, SnapshotState } from '../../../stages/battle/snapshot/snapshot-reducer';
import { spellActionReducer, SpellActionState } from '../../../stages/battle/spellAction/spell-action-reducer';

export type BattleState = {

    battleActionState: BattleActionState;
    cycleState: CycleState;
    snapshotState: SnapshotState;
    spellActionState: SpellActionState;
};

export const battleReducer = combineReducers<BattleState>({
    battleActionState: battleActionReducer,
    cycleState: cycleReducer,
    snapshotState: snapshotReducer,
    spellActionState: spellActionReducer
});

// TODO use commented reducer
// when battle state refactor will be made
// export const battleReducer: Reducer<BattleDataMap | null, any> = (state = null, action) => {

//     switch (action.type) {
//         case StageChangeAction.type:
//             const { payload } = action as StageChangeAction;
//             if (stageChangeActionPayloadMatch('battle', payload)) {
//                 return payload.data.battleData;
//             }
//     }

//     return state && { ...state };
// };
