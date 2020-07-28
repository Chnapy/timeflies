import { createReducer } from '@reduxjs/toolkit';
import { CurrentPlayer } from "../../CurrentPlayer";
import { ReceiveMessageAction } from '../../socket/wsclient-actions';

const initialState: CurrentPlayer = {
    id: 'c1',
    name: 'chnapy'
};

export const currentPlayerReducer = createReducer(initialState, {

    // TODO replace by log-in
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {
        if (payload.type === 'room/state') {
            const { playerList } = payload;
            const p = playerList[ playerList.length - 1 ];

            return {
                id: p.id,
                name: p.name
            };
        }
    }
});
