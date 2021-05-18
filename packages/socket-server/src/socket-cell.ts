import { logger } from '@timeflies/devtools';
import { ExtractMessageFromCreator, extractMessagesFromEvent, ExtractResponseFromCreator, Message, MessageCreator, MessageWithResponseCreator, SocketErrorMessage } from '@timeflies/socket-messages';
import WebSocket from 'ws';
import { SocketError } from './socket-error';

type RemoveListenerFn = () => void;

type MayBePromise<V> = V | Promise<V>;

export type ListenerFn<M extends MessageCreator<any> | MessageWithResponseCreator<any, any>> = (message: ExtractMessageFromCreator<M>) => MayBePromise<
    M extends MessageWithResponseCreator<any, any> ? ExtractResponseFromCreator<M> : void
>;

type AddListenerFn = <M extends MessageCreator<any> | MessageWithResponseCreator<any, any>>(
    messageCreator: Pick<M, 'action' | 'match' | 'schema'>,
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

    const send: SocketCell[ 'send' ] = (...messageList) => {
        logger.logMessageSent(messageList);
        socket.send(JSON.stringify(
            messageList
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

            logger.logMessageReceived(messageList);

            await Promise.all(
                messageList
                    .filter(messageCreator.match)
                    .map(async message => {
                        try {
                            const check = messageCreator.schema.validate(message);
                            if (check.error) {
                                throw new SocketError(400, check.error.stack ?? check.error + '');
                            }

                            const response = await listener(message as any);

                            if (response) {
                                send(response as Exclude<typeof response, void>);
                            }
                        } catch (err) {
                            const socketError = err instanceof SocketError
                                ? err
                                : new SocketError(500, (err as Error).stack ?? err + '');

                            logger.error(err);

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
