import { ServerAction, NarrowAction, ClientAction } from '@shared/action/TAction';

const ENDPOINT = 'ws://localhost:4275';

export class WSClient {

    private readonly socket: WebSocket;
    private readonly listeners: {
        [ K in ServerAction[ 'type' ] ]?: {
            condition?: (socket: WSClient) => boolean;
            fn: (action: NarrowAction<ServerAction, K>) => void;
        };
    };

    get isOpen(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }

    constructor() {
        this.socket = new WebSocket(ENDPOINT);
        this.listeners = {};

        this.socket.onmessage = ({data}) => {

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

            this.onMessage(action);
        };
    }

    on<A extends ServerAction>(type: A[ 'type' ], fn: (action: A) => void, condition?: (() => boolean)): void {
        this.listeners[ type ] = {
            condition,
            fn: fn as any
        };
    }

    send<A extends ClientAction>(action: Omit<A, 'sendTime'>): void {
        console.log('<-', action);
        this.socket.send(JSON.stringify({
            sendTime: Date.now(),
            ...action
        }));
    }

    private onMessage(action: ServerAction): void {
        console.log(action);

        const listener = this.listeners[ action.type ];
        if (listener) {

            const { condition, fn } = listener;
            const isOK = condition
                ? condition(this)
                : true;

            if (isOK)
                fn(action as any);
        }
    }
}