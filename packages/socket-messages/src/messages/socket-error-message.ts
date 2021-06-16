import Joi from 'joi';
import { createMessage, Message, MessageWithResponse } from '../message';

export type ErrorReason =
    | 'internal-error'
    | 'bad-request'
    | 'bad-server-state'
    | 'token-invalid'
    | 'token-expired';

type ErrorPayload = {
    reason: ErrorReason;
};

const SocketErrorMessageRaw = createMessage<ErrorPayload>('socket-error', Joi.any());

export type SocketErrorMessage = Message<ErrorPayload> | MessageWithResponse<ErrorPayload>;
export const SocketErrorMessage = Object.assign(
    (payload: ErrorPayload, requestId?: string): SocketErrorMessage => {

        const message: SocketErrorMessage = SocketErrorMessageRaw(payload);

        return { ...message, requestId };
    },
    SocketErrorMessageRaw
);
