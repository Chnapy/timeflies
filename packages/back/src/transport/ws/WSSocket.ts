import { ClientAction, DistributiveOmit, NarrowTAction, ServerAction, SetIDCAction } from '@timeflies/shared';
import WebSocket from 'ws';

export type SocketState = 'init' | 'hasID';

export type WSSocketPool = {
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
    private rooms: Set<string>;

    private readonly poolList: WSSocketPoolInner[];

    private readonly listeners: {
        [ K in ClientAction[ 'type' ] ]?: {
            condition?: (socket: WSSocket) => boolean;
            fn: (action: NarrowTAction<ClientAction, K>) => void;
        };
    };
    private readonly battleListeners: {
        [ K in ClientAction[ 'type' ] ]?: {
            condition?: (socket: WSSocket) => boolean;
            fn: (action: NarrowTAction<ClientAction, K>) => void;
        };
    };

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
        this.rooms = new Set();
        this.listeners = {};
        this.battleListeners = {};
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
                throw new Error(`typeof message not handled: ${typeof message}`);
            }

            let actionList;
            try {
                actionList = JSON.parse(message);
            } catch (e) {
                actionList = message;
            }

            if (!Array.isArray(actionList)) {
                throw new Error(`message is not an array of Action: ${JSON.stringify(actionList)}`);
            }

            return actionList.map(action => this.onMessage(action));
        });

        this.on<SetIDCAction>(
            'set-id',
            action => {
                this._id = action.id;
                this.state = 'hasID';
            },
            () => this.state === 'init');
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

    on<A extends ClientAction>(type: A[ 'type' ], fn: (action: A) => void, condition?: (() => boolean)): void {
        this.listeners[ type ] = {
            condition,
            fn: fn as any
        };
    }

    onBattle<A extends ClientAction>(type: A[ 'type' ], fn: (action: A) => void, condition?: (() => boolean)): void {
        this.battleListeners[ type ] = {
            condition,
            fn: fn as any
        };
    }

    onClose(fn: () => void) {
        this.socket.on('close', fn);
    }

    clearBattleListeners() {
        Object.keys(this.battleListeners).forEach(k => {
            delete this.battleListeners[ k as ClientAction[ 'type' ] ];
        });
    }

    send<A extends ServerAction>(...actionList: DistributiveOmit<A, 'sendTime'>[]): void {
        const sendTime = Date.now();
        this.socket.send(JSON.stringify(actionList.map(action => ({
            sendTime,
            ...action,
        }))));
    }

    addRoom(room: string): void {
        this.rooms.add(room);
    }

    removeRoom(room: string): void {
        this.rooms.delete(room);
    }

    protected onMessage(action: ClientAction): void | Promise<void[]> {
        // console.log(action);

        const poolsFns = this.poolList
            .filter(p => p.isOpen)
            .map(p => p.listeners[ action.type ])
            .filter(Boolean) as ((action: NarrowTAction<ClientAction, any>) => void | Promise<void>)[];

        const listener = this.battleListeners[ action.type ] ?? this.listeners[ action.type ];

        if (poolsFns.length) {
            return Promise.all<any>(poolsFns
                .map(fn => fn(action))
                .filter(r => r instanceof Promise)
            );
        } else if (listener) {

            const { condition, fn } = listener;
            const isOK = condition
                ? condition(this)
                : true;

            if (isOK)
                return fn(action as any);
        } else {
            console.warn(`Action received but no listener for it: ${action.type}`);
        }
    }
}