import { CurrentPlayer } from "../../CurrentPlayer";
import { GameAction, IGameAction } from "../../action/GameAction";
import { Reducer } from "redux";

export interface LoginSuccess extends IGameAction<'login/success'> {
    currentPlayer: CurrentPlayer;
}

const initialState: CurrentPlayer | undefined = undefined;

export const CurrentPlayerReducer: Reducer<CurrentPlayer | undefined, GameAction> = (state = initialState, action) => {

    switch(action.type) {
        case 'login/success':
            return action.currentPlayer;
    }

    return state;
};
