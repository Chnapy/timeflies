import { Reducer } from "redux";
import { GameAction } from "../../../action/GameAction";
import { UIStateLoad } from "../../UIState";

export const DataLoadReducer: Reducer<UIStateLoad, GameAction> = (state, action) => {

    switch (action.type) {
        case 'load/launch':
            return {
                state: 'load',
                payload: action.payload
            };
    }

    return { ...state! };
};
