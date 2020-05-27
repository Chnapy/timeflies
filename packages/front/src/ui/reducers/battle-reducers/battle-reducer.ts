import { Reducer } from '@reduxjs/toolkit';
import { BattleDataMap } from '../../../BattleData';
import { StageChangeAction, stageChangeActionPayloadMatch } from '../../../stages/stage-actions';

// export const battleReducer = createReducer(null as BattleDataMap | null, {
//     [ StageChangeAction.type ]: (state, { payload }: StageChangeAction) => {
//         if (stageChangeActionPayloadMatch('battle', payload)) {
//             return payload.data.battleData;
//         }
//     }
// });

// TODO use commented reducer
// when battle state refactor will be made
export const battleReducer: Reducer<BattleDataMap | null, any> = (state = null, action) => {

    switch (action.type) {
        case StageChangeAction.type:
            const { payload } = action as StageChangeAction;
            if (stageChangeActionPayloadMatch('battle', payload)) {
                return payload.data.battleData;
            }
    }

    return state && { ...state };
};
