import { Message } from '@timeflies/socket-messages';
import { useSocket } from '../socket/socket-context';


export const useSocketSend = () => {
    const getSocket = useSocket();

    return async <M extends Message>(message: M) => {
        const socket = await getSocket();

        socket.send(message);
    };
};
