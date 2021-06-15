import { PlayerId } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';

export type ChatNotifyMessageData = {
    message: string;
    playerId: PlayerId;
    playerName: string;
    time: number;
};

export const ChatNotifyMessage = createMessage<ChatNotifyMessageData>('chat/notify', Joi.any());
