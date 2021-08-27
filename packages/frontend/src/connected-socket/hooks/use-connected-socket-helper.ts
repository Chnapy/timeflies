import { getSocketHelperCreator, SocketHelper } from '@timeflies/socket-client';
import { MessageWithResponse } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { getEnv } from '../../env';
import { useDispatchMessageErrorIfAny } from '../../error-list/hooks/use-dispatch-error-if-any';
import { CredentialsLoginAction } from '../../login-page/store/credentials-actions';
import { useGameSelector } from '../../store/hooks/use-game-selector';

const createSocketHelper = getSocketHelperCreator(getEnv('REACT_APP_SERVER_URL'));

export const useConnectedSocketHelper = () => {
    const credentialsToken = useGameSelector(state => state.credentials?.token);
    const dispatch = useDispatch();
    const dispatchMessageErrorIfAny = useDispatchMessageErrorIfAny();

    const getSocketHelper = (token: string) => {
        const socketHelper = createSocketHelper(token);

        socketHelper.addCloseListener(event => {
            if (!event.wasClean) {
                dispatch(CredentialsLoginAction(null));
            }
        });

        socketHelper.addMessageListener(messageList => {
            messageList.forEach(message => {
                if ((message as MessageWithResponse).requestId) {
                    return;
                }

                dispatchMessageErrorIfAny(message);
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
