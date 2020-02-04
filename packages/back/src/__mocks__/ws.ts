import * as MS from "mock-socket";
import WS from 'ws';

export default class WebSocket extends MS.WebSocket implements WS {

    constructor(...args: ConstructorParameters<typeof WS>) {
        super('ws://localhost:1234');
    }

    ping(data?: any, mask?: boolean | undefined, cb?: ((err: Error) => void) | undefined): void {
    }

    pong(data?: any, mask?: boolean | undefined, cb?: ((err: Error) => void) | undefined): void {
    }

    terminate(): void {
    }

    // Events
    on(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): any {
    }

    addListener(event: any, listener: any): any {
    }

    removeListener(event: any, listener: any): any {
    }

    once(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }

    off(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }

    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error('Method not implemented.');
    }

    setMaxListeners(n: number): this {
        throw new Error('Method not implemented.');
    }

    getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }

    rawListeners(event: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        throw new Error('Method not implemented.');
    }

    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.');
    }

    listenerCount(type: string | symbol): number {
        throw new Error('Method not implemented.');
    }

}
