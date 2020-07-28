import { createReducer } from '@reduxjs/toolkit';
import { CurrentPlayer } from "../../CurrentPlayer";
import { ReceiveMessageAction } from '../../socket/wsclient-actions';

export const currentPlayerReducer = createReducer({
    id: 'c1',
    name: 'chnapy'
} as CurrentPlayer | null, {

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
