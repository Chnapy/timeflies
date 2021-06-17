import React from 'react';
import { SocketHelper } from './create-socket-helper';


export const SocketContext = React.createContext<SocketHelper | null>(null);
SocketContext.displayName = 'SocketContext';

export const SocketContextProvider = SocketContext.Provider;

export const useSocketHelper = () => {
    const socketHelper = React.useContext(SocketContext);

    if (!socketHelper) {
        throw new Error('socket not defined');
    }

    return async () => {
        if ([ WebSocket.CLOSED, WebSocket.CLOSING ].includes(socketHelper.getReadyState())) {
            console.warn('socket closed or closing');
        }

        if (socketHelper.getReadyState() === WebSocket.CONNECTING) {
            await new Promise<void>(resolve => {
                const removeListener = socketHelper.addOpenListener(() => {
                    removeListener();
                    resolve();
                });
            });
        }

        return socketHelper;
    };
};
