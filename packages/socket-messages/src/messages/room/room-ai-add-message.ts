import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomAiAddMessage = createMessage('room/ai/add', Joi.object<{ teamColor: string }>({
    teamColor: Joi.string().required()
}))
    .withResponse<RoomStateData>();
