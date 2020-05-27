import { createAction } from '@reduxjs/toolkit';

export type NotifyDeathsAction = ReturnType<typeof NotifyDeathsAction>;
export const NotifyDeathsAction = createAction('battle/notify-deaths');
