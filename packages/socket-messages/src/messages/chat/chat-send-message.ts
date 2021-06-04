import Joi from 'joi';
import { createMessage } from '../../message';

export type ChatSendMessageData = {
    message: string;
    time: number;
};

export type ChatSendMessageResponseData = {
    success: boolean;
};

export const ChatSendMessage = createMessage('chat/send', Joi.object<ChatSendMessageData>({
    message: Joi.string().required().min(1).max(300),
    time: Joi.number().required().min(1)
}))
    .withResponse<ChatSendMessageResponseData>();
