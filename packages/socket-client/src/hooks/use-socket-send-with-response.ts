import { MessageWithResponse, MessageWithResponseGetter } from '../message';
import { useSocket } from '../socket/socket-context';
import { useSocketSend } from './use-socket-send';



export const useSocketSendWithResponse = () => {
    const getSocket = useSocket();

    const send = useSocketSend();

    return async <G extends MessageWithResponseGetter<any, any>>(messageGetter: G) => {
        const socket = await getSocket();

        const message = messageGetter.get();

        await send(message);

        return new Promise<Required<G>[ '_responsePayload' ]>(resolve => {

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
