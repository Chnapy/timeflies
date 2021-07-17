import { ObjectTyped } from '@timeflies/common';
import { Message } from '@timeflies/socket-messages';
import { useSocketHelper } from '../socket/socket-context';

export type MessageListenersMap = {
    [ action in Message[ 'action' ] ]: (message: Message<any>) => void;
};

export type MessageGroupListenersMap = {
    [ action in Message[ 'action' ] ]: (messageList: Message<any>[]) => void;
};

export const useSocketListeners = () => {
    const getSocket = useSocketHelper();

    return async (listenersMap: MessageListenersMap, listenersGroupMap: MessageGroupListenersMap = {}) => {
        const socket = await getSocket();

        ObjectTyped.keys(listenersGroupMap).forEach(action => {
            if (listenersMap[ action ]) {
                throw new Error('Same action is present twice: ' + action);
            }
        });

        return socket.addMessageListener(messageList => {
            messageList
                .forEach(message => {
                    const messageListener = listenersMap[ message.action ];
                    if (messageListener) {
                        messageListener(message);
                    }
                });

            ObjectTyped.entries(listenersGroupMap).forEach(([ action, listener ]) => {
                const selectedMessageList = messageList.filter(message => message.action === action);
                if (selectedMessageList.length) {
                    listener(selectedMessageList);
                }
            });
        });
    };
};
