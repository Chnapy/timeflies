import { Reducer } from "redux";
import { GameAction, IGameAction } from "../../action/game-action/GameAction";
import { CurrentPlayer } from "../../CurrentPlayer";
import { stageChangeActionPayloadMatch } from '../../stages/stage-actions';

export interface LoginSuccess extends IGameAction<'login/success'> {
    currentPlayer: CurrentPlayer;
}

export const CurrentPlayerReducer: Reducer<CurrentPlayer | null, GameAction> = (state = null, action) => {

    switch (action.type) {

        // TODO temp for room, waiting for login page
        case 'stage/change':
            const { payload } = action;
            if (stageChangeActionPayloadMatch('room', payload)) {
                const { roomState: { playerList } } = payload.data;
                const p = playerList[ playerList.length - 1 ];

                return {
                    id: p.id,
                    name: p.name
                };
            }
            break;
        case 'login/success':
            return action.currentPlayer;
    }

    return state && { ...state };
};
