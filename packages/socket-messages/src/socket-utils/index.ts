import { Message } from '../message';

type MessageEvent = { data: unknown };

type ExtractedMessageList<M extends Message> = {
    messageList: M[];
    error?: string;
};

export const heartbeatMessageValue = '__heartbeat__';

export const extractMessagesFromEvent = <M extends Message>({ data }: MessageEvent): ExtractedMessageList<M> => {
    // heartbeat ping-pong
    if (data === heartbeatMessageValue) {
        return {
            messageList: []
        };
    }

    if (typeof data !== 'string') {
        return {
            error: `typeof message not handled: ${typeof data}`,
            messageList: []
        };
    }

    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (e) {
        parsedData = data;
    }

    if (!Array.isArray(parsedData)) {
        return {
            error: `received data is not an array of messages: ${JSON.stringify(parsedData)}`,
            messageList: []
        };
    }

    return {
        messageList: parsedData
    };
};
