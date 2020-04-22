import { CurrentPlayer } from "../../CurrentPlayer";
import { GameAction, IGameAction } from "../../action/GameAction";
import { Reducer } from "redux";

export interface LoginSuccess extends IGameAction<'login/success'> {
    currentPlayer: CurrentPlayer;
}

export const CurrentPlayerReducer: Reducer<CurrentPlayer | null, GameAction> = (state = null, action) => {

    switch (action.type) {
        case 'login/success':
            return action.currentPlayer;
    }

    return state && { ...state };
};
