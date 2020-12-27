import { ErrorCode } from '@timeflies/socket-messages';

export class SocketError extends Error {

    readonly code: ErrorCode;

    constructor(code: ErrorCode, message: string) {
        super(`SocketError ${code}: ${message}`);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SocketError);
        }
        this.name = this.constructor.name;

        this.code = code;

        Object.setPrototypeOf(this, SocketError.prototype);
    }
}
