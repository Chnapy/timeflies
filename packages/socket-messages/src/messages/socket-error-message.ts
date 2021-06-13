import Joi from 'joi';
import { createMessage, Message, MessageWithResponse } from '../message';

export type ErrorCode = 500 | 400 | 401 | 403;
type ErrorPayload = { code: ErrorCode };

const SocketErrorMessageRaw = createMessage<ErrorPayload>('socket-error', Joi.object({
    code: Joi.number()
}));

export type SocketErrorMessage = Message<ErrorPayload> | MessageWithResponse<ErrorPayload>;
export const SocketErrorMessage = Object.assign(
    (payload: ErrorPayload, requestId?: string): SocketErrorMessage => {

        const message: SocketErrorMessage = SocketErrorMessageRaw(payload);

        return { ...message, requestId };
    },
    SocketErrorMessageRaw
);
