import { CharacterId, characterIdSchema } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomCharacterRemoveMessage = createMessage('room/character/remove', Joi.object<{ characterId: CharacterId }>({
    characterId: characterIdSchema
}))
    .withResponse<RoomStateData>();
