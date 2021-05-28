import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomMapSelectMessage = createMessage('room/map/select', Joi.object<{ mapId: string }>({
    mapId: Joi.string().required()
}))
    .withResponse<RoomStateData>();
