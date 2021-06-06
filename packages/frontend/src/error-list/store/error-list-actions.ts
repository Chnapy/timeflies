import { createAction } from '@reduxjs/toolkit';
import { ErrorCode } from '@timeflies/socket-messages';

export type ErrorListAddAction = ReturnType<typeof ErrorListAddAction>;
export const ErrorListAddAction = createAction<{ code: ErrorCode }>('error-list/add');

export type ErrorListRemoveAction = ReturnType<typeof ErrorListRemoveAction>;
export const ErrorListRemoveAction = createAction<{ errorId: string }>('error-list/remove');
