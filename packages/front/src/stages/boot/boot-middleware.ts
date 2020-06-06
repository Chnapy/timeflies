import { Middleware } from '@reduxjs/toolkit';
import { SendMessageAction, ReceiveMessageAction } from '../../socket/wsclient-actions';
import { RoomStartAction } from '../../ui/reducers/room-reducers/room-actions';

export const bootMiddleware: Middleware = api => next => {

    api.dispatch(SendMessageAction({
        type: 'set-id',
        id: Math.random() + ''
    }));

    api.dispatch(SendMessageAction({
        type: 'matchmaker/enter'
    }));

    return action => {

        if (ReceiveMessageAction.match(action)) {
            const { payload } = action;

            if (payload.type === 'room/state') {
                api.dispatch(RoomStartAction({
                    roomState: payload
                }));
            }
        }

    };
};
