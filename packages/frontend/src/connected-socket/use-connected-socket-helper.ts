import { getSocketHelperCreator, SocketHelper } from '@timeflies/socket-client';
import { SocketErrorMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { ErrorListAddAction } from '../error-list/store/error-list-actions';
import { CredentialsLoginAction } from '../login-page/store/credentials-actions';
import { useGameSelector } from '../store/hooks/use-game-selector';

const createSocketHelper = getSocketHelperCreator('ws://localhost:40510');  // TODO url

export const useConnectedSocketHelper = () => {
    const [ socketHelper, setSocketHelper ] = React.useState<SocketHelper | null>(null);
    const credentialsToken = useGameSelector(state => state.credentials?.token);
    const dispatch = useDispatch();

    React.useEffect(() => {
        socketHelper?.close();

        if (credentialsToken) {
            const socketHelper = createSocketHelper(credentialsToken);

            socketHelper.addOpenListener(() => {
                setSocketHelper(socketHelper);
            });

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
        } else {
            setSocketHelper(null);
        }
    }, [ credentialsToken, socketHelper, dispatch ]);

    return socketHelper;
};
