/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { SocketHelper } from './socket';
import { SocketContextProvider } from './socket/socket-context';

type SocketHelperTestable = SocketHelper & {
    listeners: { [ type in 'open' | 'message' | 'close' | 'error' ]: Set<(...args: any[]) => void> };
};

type UseSocketHook<V extends any[]> = () => (...args: V) => Promise<any>;

export const createFakeSocketHelper = (readyState: number): SocketHelperTestable => {

    const listeners: SocketHelperTestable[ 'listeners' ] = {
        open: new Set(),
        message: new Set(),
        close: new Set(),
        error: new Set()
    };

    const sendFn = jest.fn();
    const addOpenListenerFn = jest.fn((listener) => {
        listeners.open.add(listener);
        return () => listeners.open.delete(listener);
    });
    const addMessageListenerFn = jest.fn((listener) => {
        listeners.message.add(listener);
        return () => listeners.message.delete(listener);
    });
    const addCloseListenerFn = jest.fn((listener) => {
        listeners.close.add(listener);
        return () => listeners.close.delete(listener);
    });

    return {
        getReadyState: () => readyState,
        url: '',
        close: jest.fn(),
        send: sendFn,
        addOpenListener: addOpenListenerFn,
        addMessageListener: addMessageListenerFn,
        addCloseListener: addCloseListenerFn,
        listeners
    };
};

export const renderWithContext = function <V extends any[]>(socketHelper: SocketHelper | null, hook: UseSocketHook<V>) {
    const { result } = renderHook(hook, {
        wrapper: ({ children }) => <SocketContextProvider value={socketHelper}>{children}</SocketContextProvider>
    });

    return result;
};

export function describeSocketFailures<V extends any[]>(hook: UseSocketHook<V>, ...args: V) {
    it('fails if socket not defined', async () => {

        const result = renderWithContext(null, hook);

        await expect(() => act(() =>
            result.current(...args)
        )).toThrowError();
    });
};
