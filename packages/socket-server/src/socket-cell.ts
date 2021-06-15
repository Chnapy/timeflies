import { logger } from '@timeflies/devtools';
import { ExtractMessageFromCreator, extractMessagesFromEvent, Message, MessageCreator, MessageWithResponse, MessageWithResponseCreator, SocketErrorMessage } from '@timeflies/socket-messages';
import WebSocket from 'ws';
import { SocketError } from './socket-error';

type SendFn = <M extends Message>(...messages: M[]) => void;

type RemoveListenerFn = () => void;

type MayBePromise<V> = V | Promise<V>;

export type ListenerFn<M extends MessageCreator<any> | MessageWithResponseCreator<any, any>> =
    (message: ExtractMessageFromCreator<M>, send: SendFn) => MayBePromise<void>;

type AddListenerFn = <M extends MessageCreator<any> | MessageWithResponseCreator<any, any>>(
    messageCreator: Pick<M, 'action' | 'match' | 'schema'>,
    listener: ListenerFn<M>
) => RemoveListenerFn;

export type SocketCell = {
    addMessageListener: AddListenerFn;
    addDisconnectListener: (listener: () => void) => RemoveListenerFn;
    send: SendFn;
    clearAllListeners: () => void;
    closeSocket: (error?: SocketError) => void;
    createCell: () => SocketCell;
};

export const createSocketCell = (socket: WebSocket): SocketCell => {

    type ListenerType = 'message' | 'close';

    const listeners: { [ type in ListenerType ]: Set<(...args: any[]) => any> } = {
        message: new Set(),
        close: new Set()
    };

    socket.addEventListener('close', event => {
        listeners.close.forEach(listener => {
            listener(event);
        });
    });

    socket.addEventListener('message', event => {
        if (listeners.message.size === 0) {
            return;
        }

        const { messageList, error } = extractMessagesFromEvent(event);

        if (error) {
            sendError(new SocketError(400, error));
            return;
        }

        listeners.message.forEach(listener => {
            listener(messageList);
        });
    });

    const addListener = (type: ListenerType, listener: (...args: any[]) => any): RemoveListenerFn => {
        listeners[ type ].add(listener);

        return () => listeners[ type ].delete(listener);
    };

    const send: SocketCell[ 'send' ] = (...messageList) => {
        logger.logMessageSent(messageList);
        socket.send(JSON.stringify(
            messageList
        ), err => {
            if (err) {
                logger.error(err);
            }
        });
    };

    const sendError = (error: SocketError, requestId?: string) => {
        send(SocketErrorMessage({ code: error.code }, requestId));
    };

    const addMessageListener: SocketCell[ 'addMessageListener' ] = (messageCreator, listener) => {
        const rootListener = async (messageList: Message<any>[]) => {
            await Promise.all(
                messageList
                    .filter(messageCreator.match)
                    .map(async message => {
                        try {
                            const check = messageCreator.schema.validate(message);
                            if (check.error) {
                                throw new SocketError(400, check.error.stack ?? check.error + '');
                            }

                            await listener(message as any, send);
                        } catch (err) {
                            const socketError = err instanceof SocketError
                                ? err
                                : new SocketError(500, (err as Error).stack ?? err + '');

                            logger.error(err);

                            sendError(socketError, (message as MessageWithResponse<any>).requestId);
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
        Object.values(listeners).forEach(listenerList => {
            listenerList.clear();
        });
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
