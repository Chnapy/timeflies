import { Reducer } from "redux";
import { BattleAction } from "../../../action/game-action/battle-action";
import { BattleDataMap } from '../../../BattleData';

export const BattleReducer: Reducer<BattleDataMap | null, BattleAction> = (state = null, action) => {

    switch (action.type) {
        case 'battle/launch':
            return action.battleSceneData.battleData;
    }

    return state && { ...state };
};
