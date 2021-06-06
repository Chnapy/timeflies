import { SocketContextProvider } from '@timeflies/socket-client';
import React from 'react';
import { useConnectedSocketHelper } from './use-connected-socket-helper';

export const ConnectedSocketContextProvider: React.FC = ({ children }) => {
    const socketHelper = useConnectedSocketHelper();

    return <SocketContextProvider value={socketHelper}>
        {children}
    </SocketContextProvider>;
};
