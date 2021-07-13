import { PlayerId, playerIdSchema } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomAiRemoveMessage = createMessage('room/ai/remove', Joi.object<{ playerId: PlayerId }>({
    playerId: playerIdSchema
}))
    .withResponse<RoomStateData>();
