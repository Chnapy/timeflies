import { Middleware } from '@reduxjs/toolkit';
import { GameState } from '../../game-state';
import { ReceiveMessageAction, SendMessageAction } from '../../socket/wsclient-actions';
import { RoomStartAction } from '../../ui/reducers/room-reducers/room-actions';
import { waitTimeoutPool } from '../../wait-timeout-pool';

export const bootMiddleware: Middleware<{}, GameState> = api => next => {

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    waitTimeoutPool.createTimeout(5)
        .onCompleted(async () => {

            if (api.getState().step === 'boot') {
                await api.dispatch(SendMessageAction({
                    type: 'set-id',
                    id: Math.random() + ''
                }));

                await api.dispatch(SendMessageAction({
                    type: 'matchmaker/enter'
                }));
            }
        });

    return async action => {

        const ret = next(action);

        if (ReceiveMessageAction.match(action)) {
            const { payload } = action;

            if (payload.type === 'room/state') {
                await api.dispatch(RoomStartAction({
                    roomState: payload
                }));
            }
        }

        return ret;
    };
};
