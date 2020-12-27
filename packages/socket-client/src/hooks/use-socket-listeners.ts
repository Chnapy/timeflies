import { Message } from '@timeflies/socket-messages';
import { useSocketHelper } from '../socket/socket-context';

export type MessageListenersMap = {
    [ action in Message[ 'action' ] ]: <M extends Message>(message: M) => void;
};

export const useSocketListeners = () => {
    const getSocket = useSocketHelper();

    return async (listenersMap: MessageListenersMap) => {
        const socket = await getSocket();

        return socket.addMessageListener(messageList => {
            messageList
                .forEach(message => {
                    const messageListener = listenersMap[ message.action ];
                    if (messageListener) {
                        messageListener(message);
                    }
                });
        });
    };
};
