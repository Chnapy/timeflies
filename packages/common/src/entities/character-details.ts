import * as joi from 'joi';
import { SchemaMapRequired } from 'joi';
import { Orientation, orientationSchema, Position, positionSchema } from '../geo';
import { ObjectTyped } from '../utils/object';
import { CharacterId, characterIdSchema, CharacterRole, characterRoleSchema } from './character-basics';
import { PlayerId, playerIdSchema } from './player';
import { SpellId, spellIdSchema } from './spell';

export type CharacterVariables = {
    health: number;
    actionTime: number;
    position: Position;
    orientation: Orientation;
};
const characterVariablesSchemaContent: SchemaMapRequired<CharacterVariables> = {
    health: joi.number().required().integer().min(0),
    actionTime: joi.number().required().integer().min(0),
    position: positionSchema,
    orientation: orientationSchema
};
export const characterVariablesSchema = joi.object<CharacterVariables>(characterVariablesSchemaContent);

export type CharacterVariableName = keyof CharacterVariables;
export const characterVariableNameSchema = ObjectTyped.keys(characterVariablesSchemaContent);

export type CharacterVariablesInnerMap<N extends CharacterVariableName> = {
    [ characterId in CharacterId ]: CharacterVariables[ N ];
};
export const characterVariablesInnerMapSchema = joi.object<CharacterVariablesInnerMap<CharacterVariableName>>({})
    .pattern(characterIdSchema, joi.any());

export type CharacterVariablesMap = {
    [ name in CharacterVariableName ]: CharacterVariablesInnerMap<name>;
};
export const characterVariablesMapSchema = joi.object<CharacterVariablesInnerMap<CharacterVariableName>>({})
    .pattern(characterVariableNameSchema, characterVariablesInnerMapSchema);

export type StaticCharacter = {
    characterId: CharacterId;
    playerId: PlayerId;
    characterRole: CharacterRole;
    defaultSpellId: SpellId;
};
export const staticCharacterSchema = joi.object<StaticCharacter>({
    characterId: characterIdSchema,
    playerId: playerIdSchema,
    characterRole: characterRoleSchema,
    defaultSpellId: spellIdSchema
});

export module CharacterUtils {
    export const isAlive = (health: number) => health > 0;
}
