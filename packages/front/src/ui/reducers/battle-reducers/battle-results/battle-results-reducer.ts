import { createReducer } from "@reduxjs/toolkit";
import { ReceiveMessageAction } from "../../../../socket/wsclient-actions";

export type BattleResultsState = {
    battleEnded: boolean;
    winnerTeamId: string;
};

const initialState: BattleResultsState = {
    battleEnded: false,
    winnerTeamId: ''
};

export const battleResultsReducer = createReducer(initialState, {
    [ReceiveMessageAction.type]: (state, {payload}: ReceiveMessageAction) => {
        if(payload.type === 'battle-run/end') {
            return {
                battleEnded: true,
                winnerTeamId: payload.winnerTeamId
            };
        }
    }
});
