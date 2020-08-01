import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { getEndpoint, WSQueryParams, ServerAction } from '@timeflies/shared';
import { envManager } from '../envManager';
import { SendMessageAction, ReceiveMessageAction } from './wsclient-actions';
import { waitTimeoutPool } from '../wait-timeout-pool';
import { AuthHttpSuccess } from '../ui/reducers/auth-reducers/auth-actions';
import { BatchActions } from '../store/batch-middleware';

export type WebSocketCreator = (endPoint: string) => WebSocket;

export type Dependencies = {
    websocketCreator?: WebSocketCreator;
};

const getAuthenticatedWSEndpoint = (params: WSQueryParams): string => {
    const baseEndpoint = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);

    const url = new URL(baseEndpoint);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.href;
};

export const wsClientMiddleware: (deps: Dependencies) => Middleware = ({
    websocketCreator = endpoint => new WebSocket(endpoint)
}) => (api: MiddlewareAPI) => next => {

    let socket: WebSocket | null = null;

    /**
     * If no message is send or received in an interval of 55s 
     * heroku closes the connection.
     * 
     * To fix that we regulary send pings.
     * 
     * @see https://devcenter.heroku.com/articles/error-codes#h15-idle-connection
     */
    const heartbeat = () => {

        // avoid unhandled timeouts in tests (use promises would be the same)
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        if (socket && socket.readyState === socket.OPEN) {
            socket.send("heartbeat");
        }

        // eslint-disable-next-line no-restricted-globals
        setTimeout(heartbeat, 25_000);
    };

    const send = async (action: SendMessageAction) => {

        if (!socket || socket.readyState === WebSocket.CONNECTING) {
            return waitTimeoutPool.createTimeout(1000)
                .onCompleted(() => send(action));
        }
        // console.log('<-', action.payload);

        socket.send(JSON.stringify([{
            sendTime: Date.now(),
            ...action.payload
        }]));
    };

    const onHttpAuthSuccess = ({ payload }: AuthHttpSuccess) => {

        const endpoint = getAuthenticatedWSEndpoint({
            token: payload.token
        });
        console.log('ws endpoint:', endpoint);

        socket = websocketCreator(endpoint);

        heartbeat();

        socket.onmessage = ({ data }: MessageEvent) => {

            if (typeof data !== 'string') {
                throw new TypeError(`typeof message not handled: ${typeof data}`);
            }

            let mayBeActionList;
            try {
                mayBeActionList = JSON.parse(data);
            } catch (e) {
                mayBeActionList = data;
            }

            if (!Array.isArray(mayBeActionList)) {
                throw new Error(`message is not an array of Action: ${JSON.stringify(mayBeActionList)}`);
            }

            const actionList: ServerAction[] = mayBeActionList;

            return api.dispatch(actionList.length === 1
                ? ReceiveMessageAction(actionList[0])
                : BatchActions(actionList.map(ReceiveMessageAction)));
        };
    };

    return async (action: AnyAction) => {

        const ret = next(action);

        if (SendMessageAction.match(action)) {
            await send(action);
        }

        if (AuthHttpSuccess.match(action)) {
            onHttpAuthSuccess(action);
        }

        return ret;
    };
};
