import { createReducer } from '@reduxjs/toolkit';
import { CurrentPlayer } from "../../CurrentPlayer";
import { RoomStartAction } from './room-reducers/room-actions';

export const currentPlayerReducer = createReducer(null as CurrentPlayer | null, {
    [ RoomStartAction.type ]: (state, { payload }: RoomStartAction) => {
        const { playerList } = payload.roomState;
        const p = playerList[ playerList.length - 1 ];

        return {
            id: p.id,
            name: p.name
        };
    }
});
