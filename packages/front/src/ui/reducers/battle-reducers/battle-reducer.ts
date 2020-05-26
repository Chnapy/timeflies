import { Reducer } from "redux";
import { BattleDataMap } from '../../../BattleData';
import { stageChangeActionPayloadMatch, StageChangeAction } from '../../../stages/stage-actions';

export const BattleReducer: Reducer<BattleDataMap | null, any> = (state = null, action) => {

    switch (action.type) {
        case StageChangeAction.type:
            const { payload } = action as StageChangeAction;
            if (stageChangeActionPayloadMatch('battle', payload)) {
                return payload.data.battleData;
            }
            break;
    }

    return state && { ...state };
};
