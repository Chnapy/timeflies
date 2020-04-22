import { Reducer } from "redux";
import { GameAction } from "../../../action/GameAction";
import { BattleDataMap } from '../../../BattleData';

export const BattleReducer: Reducer<BattleDataMap | null, GameAction> = (state = null, action) => {

    switch (action.type) {
        case 'battle/launch':
            return action.battleSceneData.battleData;
    }

    return state && { ...state };
};
