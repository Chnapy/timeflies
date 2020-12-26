import { Message } from '@timeflies/socket-messages';
import { useSocketHelper } from '../socket/socket-context';


export const useSocketSend = () => {
    const getSocket = useSocketHelper();

    return async <M extends Message>(...messages: M[]) => {
        const socket = await getSocket();

        socket.send(messages);
    };
};
