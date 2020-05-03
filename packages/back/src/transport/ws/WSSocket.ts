import { ClientAction, DistributiveOmit, NarrowTAction, ServerAction, SetIDCAction } from '@timeflies/shared';
import WebSocket from 'ws';

export type SocketState = 'init' | 'hasID';

export type WSSocketPool = {
    isConnected(): boolean;
    on: <A extends ClientAction>(type: A[ 'type' ], fn: (action: A) => void) => void | Promise<void>;
    onDisconnect: (fn: () => void) => void;
    send: <A extends ServerAction>(...actionList: DistributiveOmit<A, 'sendTime'>[]) => void;
    close: () => void;
};

type WSSocketPoolInner = WSSocketPool & {
    isOpen(): boolean;
    readonly listeners: {
        [ K in ClientAction[ 'type' ] ]?: (action: NarrowTAction<ClientAction, K>) => void | Promise<void>;
    };
    readonly listenerDisconnect: () => void;
};

export class WSSocket {

    private readonly socket: WebSocket;

    private readonly poolList: WSSocketPoolInner[];

    private state: SocketState;

    private _id: string;
    get id(): string {
        return this._id;
    }

    get isConnected(): boolean {
        return this.socket.readyState === this.socket.OPEN;
    }

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.state = 'init';
        this._id = '';

        this.poolList = [];


        this.socket.on('close', () => {
            const fns = this.poolList
                .filter(p => p.isOpen())
                .map(p => p.listenerDisconnect)
                .filter(Boolean) as (() => void)[];

            fns.forEach(fn => fn());
        });

        this.socket.on('message', (message): (void | Promise<void[]>)[] => {

            if (typeof message !== 'string') {
                console.error(`typeof message not handled: ${typeof message}`);
                return [];
            }

            let actionList;
            try {
                actionList = JSON.parse(message);
            } catch (e) {
                actionList = message;
            }

            if (!Array.isArray(actionList)) {
                console.error(`message is not an array of Action: ${JSON.stringify(actionList)}`);
                return [];
            }

            return actionList.map(action => this.onMessage(action));
        });

        const innerPool = this.createPool();

        innerPool.on<SetIDCAction>(
            'set-id',
            action => {
                if (this.state === 'init') {
                    this._id = action.id;
                    this.state = 'hasID';
                }
            }
        );
    }

    createPool(): WSSocketPool {

        let isOpen = true;

        let listenerDisconnect: () => void = () => { };

        const listeners: {
            [ K in ClientAction[ 'type' ] ]?: (action: NarrowTAction<ClientAction, K>) => void;
        } = {};

        const assertIsOpen = (): void | never => {
            if (!isOpen) throw new Error('pool is not open');
        };

        const pool: WSSocketPool = {
            isConnected: () => this.isConnected,
            on: (type, fn) => {
                assertIsOpen();

                listeners[ type ] = fn as any;
            },
            onDisconnect: (fn) => {
                assertIsOpen();

                listenerDisconnect = fn;
            },
            send: (...messages) => {
                assertIsOpen();

                this.send(...messages);
            },
            close: () => {
                assertIsOpen();

                for (const k in listeners) delete (listeners as any)[ k ];
                listenerDisconnect = () => { };

                isOpen = false;
            }
        };

        const innerPool: WSSocketPoolInner = {
            ...pool,
            isOpen() { return isOpen },
            listenerDisconnect: () => listenerDisconnect(),
            listeners
        };

        this.poolList.push(innerPool);

        return pool;
    }

    private send<A extends ServerAction>(...actionList: DistributiveOmit<A, 'sendTime'>[]): void {
        const sendTime = Date.now();
        this.socket.send(JSON.stringify(actionList.map(action => ({
            sendTime,
            ...action,
        }))));
    }

    protected onMessage(action: ClientAction): void | Promise<void[]> {
        // console.log(action);

        const poolsFns = this.poolList
            .filter(p => p.isOpen)
            .map(p => p.listeners[ action.type ])
            .filter(Boolean) as ((action: NarrowTAction<ClientAction, any>) => void | Promise<void>)[];

        if (poolsFns.length) {
            return Promise.all<any>(poolsFns
                .map(fn => fn(action))
                .filter(r => r instanceof Promise)
            );
        } else {
            console.warn(`Action received but no listener for it: ${action.type}`);
        }
    }
}