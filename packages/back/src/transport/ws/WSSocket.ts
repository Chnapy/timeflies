import { ClientAction, DistributiveOmit, NarrowTAction, ServerAction } from '@timeflies/shared';
import WebSocket from 'ws';
import { WSError } from './WSError';

export type WSSocketPool = {
    isConnected(): boolean;
    on: <A extends ClientAction>(type: A[ 'type' ], fn: (action: A) => void) => void;
    onDisconnect: (fn: () => void) => void;
    send: <A extends ServerAction>(...actionList: DistributiveOmit<A, 'sendTime'>[]) => void;
    sendError: (error: WSError) => void;
    close: () => WSSocket;
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

    get isConnected(): boolean {
        return this.socket.readyState === this.socket.OPEN;
    }

    constructor(socket: WebSocket) {
        this.socket = socket;

        this.poolList = [];

        this.socket.on('close', () => {
            const fns = this.poolList
                .filter(p => p.isOpen())
                .map(p => p.listenerDisconnect)
                .filter(Boolean) as (() => void)[];

            fns.forEach(fn => fn());
        });

        const onMessageFn = async (data: WebSocket.Data): Promise<void> => {
            if (typeof data !== 'string') {
                throw new WSError(400, `typeof message not handled: ${typeof data}`);
            }

            // ping-pong
            if(data === 'heartbeat') {
                return;
            }

            let actionList;
            try {
                actionList = JSON.parse(data);
            } catch (e) {
                actionList = data;
            }

            if (!Array.isArray(actionList)) {
                throw new WSError(400, `message is not an array of Action: ${JSON.stringify(actionList)}`);
            }

            await Promise.all(
                actionList.map(action => this.onMessage(action))
            );
        };

        this.socket.on('message', message => onMessageFn(message)
            .catch(reason => {
                if (reason instanceof WSError) {
                    this.sendError(reason);
                } else {
                    console.error(reason);
                    this.sendError(new WSError(500, 'unexpected error'));
                }
            })
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

                if (listeners[ type ]) {
                    throw new Error(`A listener already exist for action ${type}`);
                }

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
            sendError: (error) => {
                assertIsOpen();

                this.sendError(error);
            },
            close: () => {
                assertIsOpen();

                for (const k in listeners) delete (listeners as any)[ k ];
                listenerDisconnect = () => { };

                isOpen = false;

                return this;
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

    private sendError(error: WSError): void {
        const { code, message } = error;

        const logger = code === 500
            ? console.error
            : console.log;

        logger(message);

        this.send({
            type: 'error',
            code
        });
    }

    protected async onMessage(action: ClientAction): Promise<void> {

        const poolsFns = this.poolList
            .filter(p => p.isOpen())
            .map(p => p.listeners[ action.type ])
            .filter(Boolean) as ((action: NarrowTAction<ClientAction, any>) => void | Promise<void>)[];

        if (poolsFns.length) {
            await Promise.all<any>(poolsFns
                .map(fn => fn(action))
                .filter(r => r instanceof Promise)
            );
        } else {
            throw new WSError(404, `Action received but no listener for it: ${action.type}`);
        }
    }
}