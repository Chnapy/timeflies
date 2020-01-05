import { Reducer } from "redux";
import { GameAction } from "../../../action/GameAction";
import { UIStateBattle } from "../../UIState";

export const DataBattleReducer: Reducer<UIStateBattle, GameAction> = (state, action) => {

    switch (action.type) {
        case 'battle/launch':
            return {
                state: 'battle',
                battleData: action.battleData
            };
    }

    return { ...state! };
};
