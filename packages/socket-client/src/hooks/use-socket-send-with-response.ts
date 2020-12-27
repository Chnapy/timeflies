import { MessageWithResponse, MessageWithResponseGetter, SocketErrorMessage } from '@timeflies/socket-messages';
import { useSocketHelper } from '../socket/socket-context';
import { useSocketSend } from './use-socket-send';



export const useSocketSendWithResponse = () => {
    const getSocket = useSocketHelper();

    const send = useSocketSend();

    return async <G extends MessageWithResponseGetter<any, any>>(messageGetter: G) => {
        const socket = await getSocket();

        const message = messageGetter.get();

        await send(message);

        return new Promise<Required<G>[ '_response' ] | SocketErrorMessage>(resolve => {

            const removeListener = socket.addMessageListener<MessageWithResponse>(messageList => {
                const response = messageList.find(res => res.requestId === message.requestId);
                if (response) {
                    removeListener();
                    resolve(response);
                }
            });
        });
    };
};
