import React from 'react';
import { SocketHelper } from './create-socket-helper';


const socketContext = React.createContext<SocketHelper | null>(null);

export const SocketContextProvider = socketContext.Provider;

export const useSocketHelper = () => {
    const socketHelper = React.useContext(socketContext);

    if (!socketHelper) {
        throw new Error('socket not defined');
    }

    return async () => {
        if ([ WebSocket.CLOSED, WebSocket.CLOSING ].includes(socketHelper.getReadyState())) {
            throw new Error('socket closed or closing');
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
