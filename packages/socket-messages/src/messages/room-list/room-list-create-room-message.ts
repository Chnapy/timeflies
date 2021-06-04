import Joi from 'joi';
import { createMessage } from '../../message';

export const RoomListCreateRoomMessage = createMessage('room-list/create-room', Joi.object())
    .withResponse<{ roomId: string }>();
