import { Reducer } from "redux";
import { BattleAction } from "../../../action/game-action/battle-action";
import { BattleDataMap } from '../../../BattleData';
import { StageChangeAction } from '../../../stages/StageManager';

export const BattleReducer: Reducer<BattleDataMap | null, BattleAction> = (state = null, action) => {

    switch (action.type) {
        case 'stage/change':
            if (action.stageKey === 'battle') {
                return (action as StageChangeAction<'battle'>).payload.battleData;
            }
            break;
    }

    return state && { ...state };
};
