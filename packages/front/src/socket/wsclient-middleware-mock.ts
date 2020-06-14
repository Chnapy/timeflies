import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { getEndpoint } from '@timeflies/shared';
import { envManager } from '../envManager';
import { SendMessageAction, ReceiveMessageAction } from './wsclient-actions';
import { GameState } from '../game-state';

export const wsClientMiddlewareMock: () => Middleware = () => api => next => {

    const endpoint = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);
    console.log('ws endpoint:', endpoint);

    const send = async (action: SendMessageAction) => {

        const { payload } = action;

        if (payload.type === 'battle/spellAction') {

            // setTimeout(() => {
            //     api.dispatch(ReceiveMessageAction({
            //         type: 'confirm',
            //         isOk: false,
            //         lastCorrectHash: (api.getState() as GameState).battle.snapshotState.battleDataCurrent.battleHash,
            //         sendTime: -1
            //     }));
            // }, 300);

        }
    };

    return (action: AnyAction) => {

        if (SendMessageAction.match(action)) {
            send(action);
            return;
        }

        next(action);
    };
};
