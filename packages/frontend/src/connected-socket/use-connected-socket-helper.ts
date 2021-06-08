import { getSocketHelperCreator, SocketHelper } from '@timeflies/socket-client';
import { SocketErrorMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { getEnv } from '../env';
import { ErrorListAddAction } from '../error-list/store/error-list-actions';
import { CredentialsLoginAction } from '../login-page/store/credentials-actions';
import { useGameSelector } from '../store/hooks/use-game-selector';

const getWsUrl = () => {
    const httpUrl = getEnv('REACT_APP_SERVER_URL');
    const cutStartIndex = httpUrl.indexOf('://') + 3;
    return 'ws://' + httpUrl.substr(cutStartIndex);
};

const createSocketHelper = getSocketHelperCreator(getWsUrl());

export const useConnectedSocketHelper = () => {
    const credentialsToken = useGameSelector(state => state.credentials?.token);
    const dispatch = useDispatch();

    const getSocketHelper = (token: string) => {
        const socketHelper = createSocketHelper(token);

        socketHelper.addCloseListener(() => {
            dispatch(CredentialsLoginAction(null));
        });

        socketHelper.addMessageListener(messageList => {
            messageList.forEach(message => {
                if (SocketErrorMessage.match(message)) {
                    dispatch(ErrorListAddAction({
                        code: message.payload.code
                    }));
                }
            });
        });

        return socketHelper;
    };

    const socketRef = React.useRef<SocketHelper | null>(null);

    if (!socketRef.current && credentialsToken) {
        socketRef.current = getSocketHelper(credentialsToken);
    } else if (!credentialsToken) {
        socketRef.current?.close();
        socketRef.current = null;
    }

    return socketRef.current;
};
