import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { getEndpoint } from '@timeflies/shared';
import { envManager } from '../envManager';
import { SendMessageAction, ReceiveMessageAction } from './wsclient-actions';

export type WebSocketCreator = (endPoint: string) => WebSocket;

export type Dependencies = {
    websocketCreator?: WebSocketCreator;
}

export const wsClientMiddleware: (deps: Dependencies) => Middleware = ({
    websocketCreator = endpoint => new WebSocket(endpoint)
}) => api => next => {


    const endpoint = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);
    console.log('ws endpoint:', endpoint);

    const socket = websocketCreator(endpoint);

    const send = ({ payload }: SendMessageAction) => {
        // console.log('<-', message);
        socket.send(JSON.stringify([ {
            sendTime: Date.now(),
            ...payload
        } ]));
    };

    socket.onmessage = ({ data }: MessageEvent) => {

        if (typeof data !== 'string') {
            throw new TypeError(`typeof message not handled: ${typeof data}`);
        }

        let actionList;
        try {
            actionList = JSON.parse(data);
        } catch (e) {
            actionList = data;
        }

        if (!Array.isArray(actionList)) {
            throw new Error(`message is not an array of Action: ${JSON.stringify(actionList)}`);
        }

        actionList.forEach(action => api.dispatch(ReceiveMessageAction(action)));
    };

    return (action: AnyAction) => {

        if (SendMessageAction.match(action)) {
            send(action);
            return;
        }

        next(action);
    };
};
