import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { getEndpoint, WSQueryParams } from '@timeflies/shared';
import { envManager } from '../envManager';
import { SendMessageAction, ReceiveMessageAction } from './wsclient-actions';
import { waitTimeoutPool } from '../wait-timeout-pool';

export type WebSocketCreator = (endPoint: string) => WebSocket;

export type Dependencies = {
    websocketCreator?: WebSocketCreator;
};

// TODO
const getAuthenticatedWSEndpoint = (params: WSQueryParams): string => {
    const baseEndpoint = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);
    console.log('ws endpoint:', baseEndpoint);

    const url = new URL(baseEndpoint);

    Object.entries(params).forEach(([ key, value ]) => {
        url.searchParams.set(key, value);
    });

    return url.href;
};

export const wsClientMiddleware: (deps: Dependencies) => Middleware = ({
    websocketCreator = endpoint => new WebSocket(endpoint)
}) => api => next => {

    const endpoint = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);
    console.log('ws endpoint:', endpoint);

    const socket = websocketCreator(endpoint);

    const send = async (action: SendMessageAction) => {

        if (socket.readyState === WebSocket.CONNECTING) {
            return waitTimeoutPool.createTimeout(1000)
                .onCompleted(() => send(action));
        }
        // console.log('<-', action.payload);

        socket.send(JSON.stringify([ {
            sendTime: Date.now(),
            ...action.payload
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

        actionList.forEach(action => api.dispatch(ReceiveMessageAction(action)))
    };

    return async (action: AnyAction) => {

        const ret = next(action);

        if (SendMessageAction.match(action)) {
            await send(action);
        }

        return ret;
    };
};
