import { CharacterId, characterIdSchema, Position, positionSchema } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomCharacterPlacementMessage = createMessage('room/character/placement', Joi.object<{ 
    characterId: CharacterId;
    position: Position | null;
}>({
    characterId: characterIdSchema,
    position: positionSchema.allow(null)
}))
    .withResponse<RoomStateData>();
