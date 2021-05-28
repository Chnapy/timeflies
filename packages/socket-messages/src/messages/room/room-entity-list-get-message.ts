import { CharacterRole, CharacterVariables, SpellRole, SpellVariables } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';

export type RoomListCharacter = {
    characterRole: CharacterRole;
    defaultSpellRole: SpellRole;
    variables: Pick<CharacterVariables, 'health' | 'actionTime'>;
};

export type RoomListSpell = {
    characterRole: CharacterRole;
    spellRole: SpellRole;
    variables: SpellVariables;
};

type RoomEntityListGetMessageData = {
    characterList: RoomListCharacter[];
    spellList: RoomListSpell[];
};

export const RoomEntityListGetMessage = createMessage('room/entity/list/get', Joi.object())
    .withResponse<RoomEntityListGetMessageData>();
