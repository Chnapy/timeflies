import { ClientAction, NarrowTAction, ServerAction, SetIDCAction } from '@timeflies/shared';
import WebSocket from 'ws';
import { Util } from '../../Util';

export type SocketState = 'init' | 'hasID';

export class WSSocket {

    private readonly socket: WebSocket;
    private rooms: Set<string>;

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

        this.socket.on('message', message => {

            if (typeof message !== 'string') {
                throw new Error(`typeof message not handled: ${typeof message}`);
            }

            let action;
            try {
                action = JSON.parse(message);
            } catch (e) {
                action = message;
            }

            if (typeof action !== 'object' || typeof action.type !== 'string') {
                throw new Error(`message is not an Action: ${action}`);
            }

            this.onMessage(action);
        });

        this.on<SetIDCAction>(
            'set-id',
            action => {
                this._id = action.id;
                this.state = 'hasID';
            },
            () => this.state === 'init');
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

    send<A extends ServerAction>(action: Omit<A, 'sendTime'>): void {
        this.socket.send(JSON.stringify({
            sendTime: Date.now(),
            ...action
        }));
    }

    addRoom(room: string): void {
        this.rooms.add(room);
    }

    removeRoom(room: string): void {
        this.rooms.delete(room);
    }

    protected onMessage(action: ClientAction): void {
        console.log(action);

        const listener = this.battleListeners[ action.type ] ?? this.listeners[ action.type ];
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