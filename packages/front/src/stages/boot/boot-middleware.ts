import { Middleware } from '@reduxjs/toolkit';
import { GameState } from '../../game-state';
import { SendMessageAction } from '../../socket/wsclient-actions';
import { RoomListStart } from '../../ui/reducers/room-list-reducers/room-list-actions';
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

                await api.dispatch(RoomListStart());
            }
        });

    return async action => {

        const ret = next(action);

        return ret;
    };
};
