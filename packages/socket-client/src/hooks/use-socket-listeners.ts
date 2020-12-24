import { Message } from '@timeflies/socket-messages';
import { useSocket } from '../socket/socket-context';

export type MessageListenersMap = {
    [ action in Message[ 'action' ] ]: <M extends Message>(message: M) => void;
};

export const useSocketListeners = () => {
    const getSocket = useSocket();

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
