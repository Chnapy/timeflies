import { Message } from '@timeflies/socket-messages';

export const createSocketHelper = (socket: WebSocket) => {

    const addListener = function <K extends 'open' | 'close' | 'message' | 'error'>(type: K, listener: (event: WebSocketEventMap[ K ]) => void) {
        socket.addEventListener(type, listener);

        return () => socket.removeEventListener(type, listener);
    };

    return {
        send: (message: Message) => socket.send(JSON.stringify(message)),
        addOpenListener: (listener: () => void) => {
            return addListener('open', listener);
        },
        addCloseListener: (listener: () => void) => {
            return addListener('close', listener);
        },
        addMessageListener: <M extends Message>(listener: (messageList: M[]) => void) => {
            const rootListener = ({ data }: MessageEvent) => {

                if (typeof data !== 'string') {
                    throw new TypeError(`typeof message not handled: ${typeof data}`);
                }

                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    parsedData = data;
                }

                if (!Array.isArray(parsedData)) {
                    throw new Error(`message is not an array of Message: ${JSON.stringify(parsedData)}`);
                }

                const messageList: M[] = parsedData;

                listener(messageList);
            };

            return addListener('message', rootListener);
        }
    };
};
