import { ClientAction, ServerAction } from '@timeflies/shared';
import { IGameAction } from '../action/GameAction';
import { useDispatch } from '../useDispatch';
import { OnAction, useEvent } from '../useEvent';

export interface ReceiveMessageAction extends IGameAction<'message/receive'> {
    message: ServerAction;
}

export interface SendMessageAction extends IGameAction<'message/send'> {
    message: Omit<ClientAction, 'sendTime'>;
}

export type MessageAction = ReceiveMessageAction | SendMessageAction;

const ENDPOINT = 'ws://localhost:4275';

export class WSClient {

    private readonly socket: WebSocket;
    private readonly dispatchMessage: (message: ServerAction) => void;
    private readonly onAction: OnAction;

    get isOpen(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }

    private readonly openPromise: Promise<void>;

    constructor() {
        this.socket = new WebSocket(ENDPOINT);

        this.dispatchMessage = useDispatch({
            dispatch: (message: ServerAction) => ({
                type: 'message/receive',
                message
            })
        }).dispatch;

        this.onAction = useEvent().onAction;

        this.socket.onmessage = this.onMessage.bind(this);

        this.openPromise = new Promise((resolve, reject) => {
            this.socket.onopen = () => resolve();
            this.socket.onerror = () => reject();
        });
    }

    async waitConnect(): Promise<void> {
        return this.openPromise;
    }

    private readonly onSendMessageAction = this.onAction<SendMessageAction>('message/send', ({
        message
    }) => {
        console.log('<-', message);
        this.socket.send(JSON.stringify({
            sendTime: Date.now(),
            ...message
        }));
    });

    private onMessage({ data }: MessageEvent): void {

        if (typeof data !== 'string') {
            throw new Error(`typeof message not handled: ${typeof data}`);
        }

        let action;
        try {
            action = JSON.parse(data);
        } catch (e) {
            action = data;
        }
        console.log('->', action);

        if (typeof action !== 'object' || typeof action.type !== 'string') {
            throw new Error(`message is not an Action: ${action}`);
        }

        console.log(action);

        this.dispatchMessage(action);
    }
}