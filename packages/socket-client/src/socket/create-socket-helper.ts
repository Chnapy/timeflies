import { extractMessagesFromEvent, heartbeatMessageValue, Message } from '@timeflies/socket-messages';

export type SocketHelper = ReturnType<ReturnType<typeof getSocketHelperCreator>>;

const createEndpoint = (protocol: 'https' | 'wss', url: string) => {

    const startIndex = url.indexOf('://');
    if (startIndex !== -1) {
        url = url.substr(startIndex + 3);
    }

    return `${protocol}://${url}`;
};


const createAuthenticatedEndpoint = (token: string, serverUrl: string): string => {
    const baseEndpoint = createEndpoint('wss', serverUrl);

    const url = new URL(baseEndpoint);
    url.searchParams.set('token', token);

    return url.href;
};

export const getSocketHelperCreator = (serverUrl: string) => {
    return function createSocketHelper(token: string) {

        const endpoint = createAuthenticatedEndpoint(token, serverUrl);

        const socket = new WebSocket(endpoint);

        let heartbeatTimeout: NodeJS.Timeout;

        const startHeartbeatTimeout = () => {
            clearTimeout(heartbeatTimeout);

            heartbeatTimeout = setTimeout(() => {
                socket.send(heartbeatMessageValue);

                startHeartbeatTimeout();
            }, 30_000);
        };

        const addListener = function <K extends 'open' | 'close' | 'message' | 'error'>(type: K, listener: (event: WebSocketEventMap[ K ]) => void) {
            socket.addEventListener(type, listener);

            return () => socket.removeEventListener(type, listener);
        };

        startHeartbeatTimeout();

        addListener('close', () => clearTimeout(heartbeatTimeout));

        return {
            url: socket.url,
            getReadyState: () => socket.readyState,
            close: () => socket.close(),
            send: (messages: Message[]) => {
                socket.send(JSON.stringify(messages));

                startHeartbeatTimeout();
            },
            addOpenListener: (listener: (event: WebSocketEventMap[ 'open' ]) => void) => {
                return addListener('open', listener);
            },
            addCloseListener: (listener: (event: WebSocketEventMap[ 'close' ]) => void) => {
                return addListener('close', listener);
            },
            addMessageListener: <M extends Message>(listener: (messageList: M[]) => void) => {
                const rootListener = (event: MessageEvent) => {
                    const { messageList, error } = extractMessagesFromEvent<M>(event);

                    if (error) {
                        throw new Error(error);
                    }

                    listener(messageList);
                };

                return addListener('message', rootListener);
            }
        };
    };
};
