import { Box } from '@material-ui/core';
import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { waitMs } from '@timeflies/common';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { ChatNotifyMessage, ChatSendMessage } from '@timeflies/socket-messages';
import React from 'react';
import { Provider } from 'react-redux';
import useAsyncEffect from 'use-async-effect';
import { rootReducer } from '../../store/root-reducer';
import { ChatPanel } from './chat-panel';

export default {
    title: 'UI/Chat panel',
} as Meta;

export const Default: React.FC = () => {
    let listener: any;
    const [ socketHelper ] = React.useState<SocketHelper>({
        url: '',
        addCloseListener: () => () => { },
        addMessageListener: (l) => {
            listener = l;
            return () => { };
        },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: async ([ m ]: any) => {
            await waitMs(1000);
            listener([ ChatSendMessage.createResponse(m.requestId, {
                success: true
            }) ]);
        }
    });
    const [ store ] = React.useState(() => {
        const preloadedState = rootReducer(undefined, { type: 'foo' });
        preloadedState.credentials = {
            playerId: 'p1',
            playerName: 'chnapy',
            token: '---'
        };

        return configureStore({
            preloadedState,
            reducer: rootReducer
        });
    });

    useAsyncEffect(async () => {

        const messages = [
            {
                playerName: 'toto',
                message: 'hey everyone'
            },
            {
                playerName: 'yoshi2oeuf',
                message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillu'
            },
            {
                playerName: 'titi',
                message: 'foo-bar'
            }
        ];

        for (const { playerName, message } of messages) {
            await waitMs(5000);
            listener([ ChatNotifyMessage({
                time: Date.now(),
                playerId: '',
                playerName,
                message
            }) ]);
        }

    }, []);

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>

                <Box width={200} height={150} m={4}>
                    <ChatPanel />
                </Box>

            </SocketContextProvider>
        </Provider>
    );
};
