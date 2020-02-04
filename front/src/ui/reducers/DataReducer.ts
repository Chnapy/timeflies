import { Reducer } from "redux";
import { GameAction } from "../../action/GameAction";
import { UIStateData } from "../UIState";
import { DataLoadReducer } from "./loadReducers/DataLoadReducer";
import { DataBattleReducer } from "./battleReducers/DataBattleReducer";

const initialState: UIStateData = {
    state: 'boot'
};

export const DataReducer: Reducer<UIStateData, GameAction> = (state = initialState, action) => {

    switch (action.type) {
        case 'load/launch':
            return DataLoadReducer(undefined, action);
        case 'battle/launch':
            return DataBattleReducer(undefined, action);
    }

    switch (state.state) {
        case 'boot':
            return state;
        case 'load':
            return DataLoadReducer(state, action);
        case 'battle':
            return DataBattleReducer(state, action);
    }

};
