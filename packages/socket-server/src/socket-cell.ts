import { ExtractMessageFromCreator, extractMessagesFromEvent, ExtractResponseFromCreator, Message, MessageCreator, MessageWithResponseCreator, SocketErrorMessage } from '@timeflies/socket-messages';
import WebSocket from 'ws';
import { SocketError } from './socket-error';

type RemoveListenerFn = () => void;

type MayBePromise<V> = V | Promise<V>;

type ListenerFn<M extends MessageCreator | MessageWithResponseCreator> = (message: ExtractMessageFromCreator<M>) => MayBePromise<
    M extends MessageWithResponseCreator ? ExtractResponseFromCreator<M> : void
>;

type AddListenerFn = <M extends MessageCreator | MessageWithResponseCreator>(
    messageCreator: Pick<M, 'match'>,
    listener: ListenerFn<M>
) => RemoveListenerFn;

export type SocketCell = {
    addMessageListener: AddListenerFn;
    addDisconnectListener: (listener: () => void) => RemoveListenerFn;
    send: <M extends Message>(...messages: M[]) => void;
    clearAllListeners: () => void;
    closeSocket: (error?: SocketError) => void;
    createCell: () => SocketCell;
};

export const createSocketCell = (socket: WebSocket): SocketCell => {

    type ListenerType = 'message' | 'close';

    const listeners: [ ListenerType, () => any ][] = [];

    const addListener = (type: ListenerType, listener: (...args: any[]) => any): RemoveListenerFn => {
        listeners.push([ type, listener ]);
        socket.addEventListener(type, listener);

        return () => socket.removeEventListener(type, listener);
    };

    const send: SocketCell[ 'send' ] = (...messages) => {
        socket.send(JSON.stringify(
            messages
        ));
    };

    const sendError = (error: SocketError) => {
        send(SocketErrorMessage({
            code: error.code
        }));
    };

    const addMessageListener: SocketCell[ 'addMessageListener' ] = (messageCreator, listener) => {
        const rootListener = async (event: { data: unknown }) => {

            const { messageList, error } = extractMessagesFromEvent(event);

            if (error) {
                sendError(new SocketError(400, error));
                return;
            }

            await Promise.all(
                messageList
                    .filter(messageCreator.match)
                    .map(async message => {
                        try {
                            const response = await listener(message as any);

                            if (response) {
                                send(response as Exclude<typeof response, void>);
                            }
                        } catch (err) {
                            const socketError = err instanceof SocketError
                                ? err
                                : new SocketError(500, (err as Error).stack ?? err + '');

                            sendError(socketError);
                        }
                    })
            );
        };

        return addListener('message', rootListener);
    };

    const addDisconnectListener: SocketCell[ 'addDisconnectListener' ] = listener => {
        return addListener('close', listener);
    };

    const clearAllListeners: SocketCell[ 'clearAllListeners' ] = () => {
        listeners.forEach(([ type, listener ]) => socket.removeEventListener(type, listener));
        listeners.splice(0, Infinity);
    };

    const closeSocket: SocketCell[ 'closeSocket' ] = error => {
        if (error) {
            sendError(error);
        }
        socket.close();
    };

    return {
        send,
        addMessageListener,
        addDisconnectListener,
        clearAllListeners,
        closeSocket,
        createCell: () => createSocketCell(socket)
    };
};
