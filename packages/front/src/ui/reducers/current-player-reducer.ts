import { CurrentPlayer } from "../../CurrentPlayer";
import { GameAction, IGameAction } from "../../action/game-action/GameAction";
import { Reducer } from "redux";
import { StageChangeAction } from '../../stages/StageManager';

export interface LoginSuccess extends IGameAction<'login/success'> {
    currentPlayer: CurrentPlayer;
}

export const CurrentPlayerReducer: Reducer<CurrentPlayer | null, GameAction> = (state = null, action) => {

    switch (action.type) {

        // TODO temp for room, waiting for login page
        case 'stage/change':
            if (action.stageKey === 'room') {
                const { payload: { roomState: { playerList } } } = action as StageChangeAction<'room'>;
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
