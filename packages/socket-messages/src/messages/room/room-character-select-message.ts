import { CharacterRole, characterRoleSchema } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomCharacterSelectMessage = createMessage('room/character/select', Joi.object<{ characterRole: CharacterRole }>({
    characterRole: characterRoleSchema
}))
    .withResponse<RoomStateData>();
