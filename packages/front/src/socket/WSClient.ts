import { ClientAction, ServerAction, DistributiveOmit } from '@timeflies/shared';
import { IGameAction } from '../action/GameAction';
import { serviceDispatch } from '../services/serviceDispatch';
import { OnAction, serviceEvent } from '../services/serviceEvent';

export interface ReceiveMessageAction<A extends ServerAction = ServerAction> extends IGameAction<'message/receive'> {
    message: A;
}

export interface SendMessageAction<A extends ClientAction = ClientAction> extends IGameAction<'message/send'> {
    message: DistributiveOmit<A, 'sendTime'>;
}

export type MessageAction = ReceiveMessageAction | SendMessageAction;

const ENDPOINT = 'ws://localhost:4275';

export interface WSClient {
    readonly isOpen: boolean;
    waitConnect(): Promise<void>;
}

export const WSClient = (): WSClient => {

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

        let action;
        try {
            action = JSON.parse(data);
        } catch (e) {
            action = data;
        }
        console.log('->', action);

        if (typeof action !== 'object' || typeof action.type !== 'string') {
            throw new TypeError(`message is not an Action: ${action}`);
        }

        console.log(action);

        dispatchMessage(action);
    };

    onAction<SendMessageAction>('message/send', ({
        message
    }) => {
        console.log('<-', message);
        socket.send(JSON.stringify({
            sendTime: Date.now(),
            ...message
        }));
    });

    const socket = new WebSocket(ENDPOINT);

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