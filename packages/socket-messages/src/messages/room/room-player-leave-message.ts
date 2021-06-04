import Joi from 'joi';
import { createMessage } from '../../message';

export const RoomPlayerLeaveMessage = createMessage('room/player/leave', Joi.object());
