import { Middleware } from '@reduxjs/toolkit';
import { SendMessageAction, ReceiveMessageAction } from '../../socket/wsclient-actions';
import { RoomStartAction } from '../../ui/reducers/room-reducers/room-actions';
import { GameState } from '../../game-state';

export const bootMiddleware: Middleware<{}, GameState> = api => next => {

    setTimeout(() => {
        if (api.getState().step === 'boot') {
            api.dispatch(SendMessageAction({
                type: 'set-id',
                id: Math.random() + ''
            }));

            api.dispatch(SendMessageAction({
                type: 'matchmaker/enter'
            }));
        }
    });

    return action => {

        next(action);

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
