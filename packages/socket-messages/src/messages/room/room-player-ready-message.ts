import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomPlayerReadyMessage = createMessage('room/player/ready', Joi.object<{ ready: boolean }>({
    ready: Joi.boolean().required()
}))
    .withResponse<RoomStateData>();
