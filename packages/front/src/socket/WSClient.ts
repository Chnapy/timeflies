import { ClientAction, DistributiveOmit, getEndpoint, ServerAction } from '@timeflies/shared';
import { IGameAction } from '../action/game-action/GameAction';
import { envManager } from '../envManager';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';

export interface ReceiveMessageAction<A extends ServerAction = ServerAction> extends IGameAction<'message/receive'> {
    message: A;
}

export interface SendMessageAction<A extends ClientAction = ClientAction> extends IGameAction<'message/send'> {
    message: DistributiveOmit<A, 'sendTime'>;
}

export type MessageAction = ReceiveMessageAction | SendMessageAction;

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
        dispatchMessage: (message: ServerAction) => ({
            type: 'message/receive',
            message
        })
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

    onAction<SendMessageAction>('message/send', ({
        message
    }) => {
        // console.log('<-', message);
        socket.send(JSON.stringify([ {
            sendTime: Date.now(),
            ...message
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