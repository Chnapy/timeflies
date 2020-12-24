import { act, renderHook } from '@testing-library/react-hooks';
import { Message } from '@timeflies/socket-messages';
import React from 'react';
import { SocketContextProvider } from './socket/socket-context';

type WebSocketTestable = WebSocket & {
    listeners: { [ type in 'open' | 'message' | 'close' | 'error' ]: Set<(...args: any[]) => void> };
};

type UseSocketHook<V> = () => (value: V) => Promise<any>;

export const createFakeSocket = (readyState: number) => {

    const listeners: WebSocketTestable[ 'listeners' ] = {
        open: new Set(),
        message: new Set(),
        close: new Set(),
        error: new Set()
    };

    const sendFn = jest.fn();
    const addEventListenerFn = jest.fn((type: keyof WebSocketTestable[ 'listeners' ], listener) => {
        listeners[ type ].add(listener);
    });
    const removeEventListenerFn = jest.fn((type: keyof WebSocketTestable[ 'listeners' ], listener) => {
        listeners[ type ].delete(listener);
    });

    const socket: WebSocketTestable = {
        listeners,
        readyState,
        send: sendFn as any,
        addEventListener: addEventListenerFn as any,
        removeEventListener: removeEventListenerFn as any
    } as WebSocketTestable;

    return socket;
};

export const renderWithContext = function <V>(socket: WebSocket | null, hook: UseSocketHook<V>) {
    const { result } = renderHook(hook, {
        wrapper: ({ children }) => <SocketContextProvider value={socket}>{children}</SocketContextProvider>
    });

    return result;
};

export const createMessageEvent = function<M extends Message>(...messageList: M[]): Pick<MessageEvent, 'data'> {
    return {
        data: JSON.stringify(messageList)
    };
};

export function describeSocketFailures<V>(hook: UseSocketHook<V>, value: V) {
    describe('fails if', () => {
        it('socket not defined', async () => {

            const result = renderWithContext(null, hook);

            await expect(() => act(() =>
                result.current(value)
            )).toThrowError();
        });

        const expectSocketWithState = (readyState: number) => {
            const socket = createFakeSocket(readyState);

            const result = renderWithContext(socket, hook);

            return {
                toRejectError: async () => {
                    expect(socket.send).not.toHaveBeenCalled();
                    expect(socket.addEventListener).not.toHaveBeenCalled();

                    await expect(act(() =>
                        result.current(value)
                    )).rejects.toBeDefined();
                }
            };
        };

        it('socket closed', async () => {
            await expectSocketWithState(WebSocket.CLOSED).toRejectError();
        });

        it('socket closing', async () => {
            await expectSocketWithState(WebSocket.CLOSING).toRejectError();
        });
    });
};
