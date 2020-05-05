import { TAction } from './TAction';

export type ErrorCode =
    | 500
    | 400
    | 401
    | 403;

export type ErrorServerAction = TAction<'error'> & {
    code: ErrorCode;
};
