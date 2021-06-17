import { createAction } from '@reduxjs/toolkit';
import { ErrorReason } from '@timeflies/socket-messages';

export type ErrorListAddAction = ReturnType<typeof ErrorListAddAction>;
export const ErrorListAddAction = createAction<{ reason: ErrorReason }>('error-list/add');

export type ErrorListRemoveAction = ReturnType<typeof ErrorListRemoveAction>;
export const ErrorListRemoveAction = createAction<{ errorId: string }>('error-list/remove');
