import { getEndpoint, ServerAction } from '@timeflies/shared';
import { envManager } from '../envManager';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';
import { ReceiveMessageAction, SendMessageAction } from './wsclient-actions';

export interface WSClient {
    readonly isOpen: boolean;
    waitConnect(): Promise<void>;
}

export interface WebSocketCreator {
    (endPoint: string): WebSocket;
}

interface Dependencies {
    websocketCreator: WebSocketCreator;
}

export const WSClient = ({ websocketCreator }: Dependencies = {
    websocketCreator: endPoint => new WebSocket(endPoint)
}): WSClient => {

    const ENDPOINT = getEndpoint('ws', envManager.REACT_APP_SERVER_URL);
    console.log('ws endpoint:', ENDPOINT);

    const { dispatchMessage } = serviceDispatch({
        dispatchMessage: (message: ServerAction) => ReceiveMessageAction(message) as any,
    });

    const { onAction } = serviceEvent();

    const onMessage = ({ data }: MessageEvent): void => {

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

        actionList.forEach(action => dispatchMessage(action));

        // console.log(action);

        // dispatchMessage(action);
    };

    onAction(SendMessageAction, payload => {
        // console.log('<-', message);
        socket.send(JSON.stringify([ {
            sendTime: Date.now(),
            ...payload
        } ]));
    });

    const socket = websocketCreator(ENDPOINT);

    socket.onmessage = onMessage;

    const openPromise = new Promise<void>((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = () => reject();
    });

    return {
        get isOpen(): boolean {
            return socket.readyState === WebSocket.OPEN;
        },
        async waitConnect(): Promise<void> {
            return openPromise;
        }
    };
}