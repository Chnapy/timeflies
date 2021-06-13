import { logger } from '@timeflies/devtools';
import { extractMessagesFromEvent } from '@timeflies/socket-messages';
import WebSocket from 'ws';

export const addSocketListenersLogger = (socket: WebSocket) => {
    socket.addEventListener('message', event => {
        const { messageList, error } = extractMessagesFromEvent(event);
        if (error) {
            return;
        }

        logger.logMessageReceived(messageList);
    });
};
