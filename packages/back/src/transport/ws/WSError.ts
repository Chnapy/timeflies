import { ErrorCode } from '@timeflies/shared';

export class WSError extends Error {

    readonly code: ErrorCode;

    constructor(code: ErrorCode, message: string) {
        super(`WS error ${code}: ${message}`);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, WSError);
        }
        this.name = this.constructor.name;

        this.code = code;

        Object.setPrototypeOf(this, WSError.prototype);
    }
}
