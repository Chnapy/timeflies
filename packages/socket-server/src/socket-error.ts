import { ErrorReason } from '@timeflies/socket-messages';

export class SocketError extends Error {

    readonly reason: ErrorReason;

    constructor(reason: ErrorReason, message: string) {
        super(`SocketError ${reason}: ${message}`);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SocketError);
        }
        this.name = this.constructor.name;

        this.reason = reason;

        Object.setPrototypeOf(this, SocketError.prototype);
    }
}
