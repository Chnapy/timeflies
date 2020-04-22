import { BattleLoadPayload } from '@timeflies/shared';
import { Reducer } from "redux";
import { GameAction } from "../../../action/GameAction";

export const LoadReducer: Reducer<BattleLoadPayload | null, GameAction> = (state = null, action) => {

    switch (action.type) {
        case 'load/launch':
            return action.payload;
    }

    return state && { ...state };
};
