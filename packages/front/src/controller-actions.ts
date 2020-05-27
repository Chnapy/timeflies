import { createAction } from '@reduxjs/toolkit';

export type AppResetAction = ReturnType<typeof AppResetAction>;
export const AppResetAction = createAction('app/reset');
