import { RoomListItem, Normalized, normalize } from '@timeflies/shared';
import { createReducer } from '@reduxjs/toolkit';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';

export type RoomListState = {
    list: Normalized<RoomListItem>;
    ids: string[];
};

const initialState: RoomListState = {
    list: {},
    ids: []
};

export const roomListReducer = createReducer(initialState, {
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {
        if (payload.type === 'room-list/list') {

            state.list = normalize(payload.list);
            state.ids = payload.list.map(r => r.id);

        }
    }
});

