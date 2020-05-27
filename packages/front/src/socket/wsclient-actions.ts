import { createAction } from '@reduxjs/toolkit';
import { ServerAction, ClientAction, DistributiveOmit } from '@timeflies/shared';

// TODO handle message type as root
export type ReceiveMessageAction = ReturnType<typeof ReceiveMessageAction>;
export const ReceiveMessageAction = createAction<ServerAction>('message/receive');

export type SendMessageAction = ReturnType<typeof SendMessageAction>;
export const SendMessageAction = createAction<
    DistributiveOmit<ClientAction, 'sendTime'>
>('message/send');
