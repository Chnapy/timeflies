import { createId } from '@timeflies/common';
import * as joi from 'joi';
import { Schema } from 'joi';

export type Message<P extends {} = {}> = {
    action: string;
    payload: P;
};

export type MessageCreator<P extends {} = {}> = {
    (payload: P): Message<P>;
    action: string;
    match: (message: Message<any>) => message is Message<P>;
    schema: Schema<Message<P>>;
    withResponse: <R extends {}>() => MessageWithResponseCreator<P, R>;
};

export const createMessage = <P extends {}>(action: string, payloadSchema: Schema<P>): MessageCreator<P> => {
    const messageCreator = (payload: P): Message<P> => ({ action, payload });

    messageCreator.action = action;

    messageCreator.match = (message: Message<any>): message is ReturnType<typeof messageCreator> => message.action === action;

    messageCreator.schema = joi.object<Message<P>>({
        action,
        payload: payloadSchema
    });

    messageCreator.withResponse = <R>() => createMessageWithResponse<P, R>(action, payloadSchema);

    return messageCreator;
};

export type MessageWithResponse<P extends {} = {}> = Message<P> & {
    requestId: string;
};

export type MessageWithResponseGetter<P extends {}, R extends {}> = {
    get: () => MessageWithResponse<P>;

    // hack for typing only
    _response?: MessageWithResponse<R>;
};

export type MessageWithResponseCreator<P extends {} = {}, R extends {} = {}> = {
    (payload: P): MessageWithResponseGetter<P, R>;
    action: string;
    match: (message: Message<any>) => message is MessageWithResponse<P>;
    schema: Schema<Message<P>>;
    createResponse: (requestId: string, payload: R) => MessageWithResponse<R>;
};

const createMessageWithResponse = <P extends {}, R extends {}>(action: string, messagePayloadSchema: Schema<P>): MessageWithResponseCreator<P, R> => {
    const messageCreator = (payload: P): MessageWithResponseGetter<P, R> => ({
        get: (): MessageWithResponse<P> => ({
            action,
            payload,
            requestId: createId()
        })
    });

    messageCreator.action = action;

    messageCreator.match = (message: Message<any>): message is MessageWithResponse<P> => message.action === action;

    messageCreator.schema = joi.object<MessageWithResponse<P>>({
        action,
        payload: messagePayloadSchema,
        requestId: joi.string().required()
    });

    messageCreator.createResponse = (requestId: string, payload: R): MessageWithResponse<R> => ({ action, payload, requestId });

    return messageCreator;
};

export type ExtractMessageFromCreator<C extends MessageCreator<any> | MessageWithResponseCreator<any, any>> = C extends MessageWithResponseCreator<infer P, any>
    ? ReturnType<ReturnType<MessageWithResponseCreator<P>>[ 'get' ]>
    : ReturnType<C>;

export type ExtractResponseFromCreator<C extends MessageWithResponseCreator<any, any>> = C extends MessageWithResponseCreator<any, infer R>
    ? MessageWithResponse<R>
    : never;
