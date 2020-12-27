import { extractMessagesFromEvent, heartbeatMessageValue, Message } from '@timeflies/socket-messages';

export type SocketHelper = ReturnType<ReturnType<typeof getSocketHelperCreator>>;

const createEndpoint = (protocol: 'http' | 'ws', url: string) => {

    const isHttps = url.startsWith('https');

    const startIndex = url.indexOf('://');
    if (startIndex !== -1) {
        url = url.substr(startIndex + 3);
    }

    const prefix = isHttps
        ? protocol + 's'
        : protocol;

    return `${prefix}://${url}`;
};


const createAuthenticatedEndpoint = (token: string, serverUrl: string): string => {
    const baseEndpoint = createEndpoint('ws', serverUrl);

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

        return {
            url: socket.url,
            getReadyState: () => socket.readyState,
            close: () => socket.close(),
            send: (messages: Message[]) => {
                socket.send(JSON.stringify(messages));

                startHeartbeatTimeout();
            },
            addOpenListener: (listener: () => void) => {
                return addListener('open', listener);
            },
            addCloseListener: (listener: () => void) => {
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
