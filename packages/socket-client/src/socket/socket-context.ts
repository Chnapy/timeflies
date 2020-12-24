import React from 'react';
import { createSocketHelper } from './create-socket-helper';


const socketContext = React.createContext<WebSocket | null>(null);

export const SocketContextProvider = socketContext.Provider;

export const useSocket = () => {
    const socket = React.useContext(socketContext);

    if (!socket) {
        throw new Error('socket not defined');
    }

    return async () => {
        if ([ WebSocket.CLOSED, WebSocket.CLOSING ].includes(socket.readyState)) {
            throw new Error('socket closed or closing');
        }

        const helper = createSocketHelper(socket);

        if (socket.readyState === WebSocket.CONNECTING) {
            await new Promise(resolve => {
                const removeListener = helper.addOpenListener(() => {
                    removeListener();
                    resolve();
                });
            });
        }

        return helper;
    };
};
