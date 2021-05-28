import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomStateMessage = createMessage<RoomStateData>('room/state', Joi.object());
