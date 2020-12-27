import { createMessage } from '../message';

export type ErrorCode = 500 | 400 | 401 | 403 | 404;

export type SocketErrorMessage = ReturnType<typeof SocketErrorMessage>;
export const SocketErrorMessage = createMessage<{ code: ErrorCode }>('socket-error');
