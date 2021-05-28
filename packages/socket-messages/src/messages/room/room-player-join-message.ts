import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomPlayerJoinMessage = createMessage('room/player/join', Joi.object<{ roomId: string }>({
    roomId: Joi.string().required()
}))
    .withResponse<RoomStateData>();
