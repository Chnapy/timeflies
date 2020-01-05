/* eslint-disable */
import * as Colyseus from 'colyseus.js';
import { SampleData } from './SampleBattleData';

export class Client implements Omit<Colyseus.Client, 'endpoint' | 'joinOrCreate'> {
    auth!: Colyseus.Auth;
    push!: import("colyseus.js/lib/Push").Push;

    constructor(endpoint: string) {
    }

    joinOrCreate<T>(roomName: string, options?: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Room<T>> {
        return new Promise(r => r(new Room()));
    }
    create<T>(roomName: string, options?: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    join<T>(roomName: string, options?: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    joinById<T>(roomId: string, options?: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    reconnect<T>(roomId: string, sessionId: string, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    getAvailableRooms<Metadata = any>(roomName?: string | undefined): Promise<import("colyseus.js/lib/Room").RoomAvailable<Metadata>[]> {
        throw new Error('Method not implemented.');
    }
    consumeSeatReservation<T>(response: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    protected createMatchMakeRequest<T>(method: string, roomName: string, options?: any, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Promise<Colyseus.Room<T>> {
        throw new Error('Method not implemented.');
    }
    protected createRoom<T>(roomName: string, rootSchema?: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<T> | undefined): Colyseus.Room<T> {
        throw new Error('Method not implemented.');
    }
    protected buildEndpoint(room: any, options?: any): string {
        throw new Error('Method not implemented.');
    }
}

export class Room<S> implements Omit<Colyseus.Room<S>, ''> {
    state: S;
    id!: string;
    sessionId!: string;
    name!: string;
    onJoin!: {
        (cb: (...args: any[]) => void | Promise<any>): import("strong-events/lib").EventEmitter<(...args: any[]) => void | Promise<any>>;
        once(cb: (code: number) => void): void;
        remove(cb: (code: number) => void): void;
        invoke(code: number): void;
        invokeAsync(code: number): Promise<any[]>;
        clear(): void;
    };
    onStateChange!: {
        (cb: (state: S) => void): import("strong-events/lib").EventEmitter<(state: S) => void>;
        once(cb: (code: S) => void): void;
        remove(cb: (code: S) => void): void;
        invoke(code: S): void;
        invokeAsync(code: S): Promise<S[]>;
        clear(): void;
    };
    onMessage!: {
        (cb: (data: any) => void): import("strong-events/lib").EventEmitter<(data: any) => void>;
        once(cb: (code: number) => void): void;
        remove(cb: (code: number) => void): void;
        invoke(code: number): void;
        invokeAsync(code: number): Promise<any[]>;
        clear(): void;
    };
    onError!: {
        (cb: (message: string) => void): import("strong-events/lib").EventEmitter<(message: string) => void>;
        once(cb: (message: string) => void): void;
        remove(cb: (code: string) => void): void;
        invoke(code: string): void;
        invokeAsync(code: string): Promise<any[]>;
        clear(): void;
    };
    onLeave!: {
        (cb: (code: number) => void): import("strong-events/lib").EventEmitter<(code: number) => void>;
        once(cb: (code: number) => void): void;
        remove(cb: (code: number) => void): void;
        invoke(code: number): void;
        invokeAsync(code: number): Promise<any[]>;
        clear(): void;
    };
    connection!: import("colyseus.js/lib/Connection").Connection;
    serializerId!: string;
    protected serializer!: import("colyseus.js/lib/serializer/Serializer").Serializer<any>;
    protected hasJoined!: boolean;
    protected previousCode!: Colyseus.Protocol;
    protected rootSchema!: import("colyseus.js/lib/serializer/SchemaSerializer").SchemaConstructor<any>;

    mockResponse: (delay: number, data: any, time?: number) => void;

    constructor() {
        this.state = SampleData as any;

        let buffer;
        this.onMessage = (cb => {
            buffer = cb;
        }) as any;
        this.mockResponse = (delay, data, time) => setTimeout(() => buffer({
            ...data,
            time: time || Date.now
        }), delay);
    }

    connect(endpoint: string): void {
        throw new Error('Method not implemented.');
    }
    leave(consented?: boolean | undefined): void {
        throw new Error('Method not implemented.');
    }
    send(data: any): void {
    }
    listen(segments: string, callback: Function, immediate?: boolean | undefined): import("@gamestdio/state-listener").Listener {
        throw new Error('Method not implemented.');
    }
    removeListener(listener: import("@gamestdio/state-listener").Listener): void {
        throw new Error('Method not implemented.');
    }
    removeAllListeners(): void {
        throw new Error('Method not implemented.');
    }
    protected onMessageCallback(event: MessageEvent): void {
        throw new Error('Method not implemented.');
    }
    protected setState(encodedState: any): void {
        throw new Error('Method not implemented.');
    }
    protected patch(binaryPatch: any): void {
        throw new Error('Method not implemented.');
    }


}