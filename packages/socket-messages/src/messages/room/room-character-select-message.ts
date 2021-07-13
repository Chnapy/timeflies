import { CharacterRole, characterRoleSchema, PlayerId, playerIdSchema } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomCharacterSelectMessage = createMessage('room/character/select', Joi.object<{
    aiPlayerId: PlayerId | null;
    characterRole: CharacterRole;
}>({
    aiPlayerId: playerIdSchema.allow(null),
    characterRole: characterRoleSchema
}))
    .withResponse<RoomStateData>();
