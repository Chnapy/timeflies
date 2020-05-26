import { createAction } from '@reduxjs/toolkit';
import { ServerAction } from '@timeflies/shared';

export type ReceiveMessageAction = ReturnType<typeof ReceiveMessageAction>;

// TODO handle message type as root
export const ReceiveMessageAction = createAction<ServerAction>('message/receive');
