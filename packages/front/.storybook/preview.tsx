// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/sokoban.png';
import { addDecorator } from '@storybook/react';
import { Controller } from '../src/Controller';
import { WebSocketCreator } from '../src/socket/WSClient';

class MockWebSocket implements WebSocket {
    prototype: any;

    readonly CLOSED: any;
    readonly CLOSING: any;
    readonly CONNECTING: any;
    readonly OPEN: any = WebSocket.OPEN;

    binaryType;
    bufferedAmount;
    extensions;
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;
    protocol;
    readyState = WebSocket.OPEN;
    url;

    constructor() {
    }

    close(code?: number | undefined, reason?: string | undefined): void {
    }
    send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void {
    }

    addEventListener<K extends "close" | "error" | "message" | "open">(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: any, listener: any, options?: any) {
    }

    removeEventListener<K extends "close" | "error" | "message" | "open">(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: any, listener: any, options?: any) {
    }

    dispatchEvent(event: Event): boolean {
        return false;
    }
}

export interface StoryProps {
    websocketCreator: WebSocketCreator;
    controllerStart: (container: Element) => Promise<void>;
}

addDecorator((storyFn, context) => {

    let socket!: MockWebSocket;

    const websocketCreator: WebSocketCreator = () => {
        socket = new MockWebSocket();
        return socket;
    };

    const { start } = Controller.init({ websocketCreator });

    const props: StoryProps = {
        websocketCreator,
        controllerStart: (container: Element) => start(container)
            .then(() => {
                socket.onopen!(null as any);
            })
    };

    return storyFn({
        ...context,
        ...props
    });
})

export { };
