import { any, number, object, string } from 'joi';
import { Orientation, orientationSchema, Position, positionSchema } from '../geo';
import { ObjectTyped } from '../utils';
import { PlayerId, playerIdSchema } from './player';
import { SpellId, spellIdSchema } from './spell';

export type CharacterId = string;
export const characterIdSchema = string().required().min(1);

export type CharacterDuration = number;
export const characterDurationSchema = number().required().integer().min(0);

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = [
    'vemo', 'tacka', 'meti'
] as const;
export const characterRoleSchema = characterRoleList;

export type CharacterVariables = {
    health: number;
    actionTime: number;
    position: Position;
    orientation: Orientation;
};
export const characterVariablesSchema = object<CharacterVariables>({
    health: number().required().integer().min(0),
    actionTime: number().required().integer().min(0),
    position: positionSchema,
    orientation: orientationSchema
});

export type CharacterVariableName = keyof CharacterVariables;
export const characterVariableNameSchema = ObjectTyped.keys(characterVariablesSchema.describe().keys) as CharacterVariableName[];

export type CharacterVariablesInnerMap<N extends CharacterVariableName> = {
    [ characterId in CharacterId ]: CharacterVariables[ N ];
};
export const characterVariablesInnerMapSchema = object<CharacterVariablesInnerMap<CharacterVariableName>>({})
    .pattern(characterIdSchema, any());

export type CharacterVariablesMap = {
    [ name in CharacterVariableName ]: CharacterVariablesInnerMap<name>;
};
export const characterVariablesMapSchema = object<CharacterVariablesInnerMap<CharacterVariableName>>({})
    .pattern(characterVariableNameSchema, characterVariablesInnerMapSchema);

export type StaticCharacter = {
    characterId: CharacterId;
    playerId: PlayerId;
    characterRole: CharacterRole;
    defaultSpellId: SpellId;
};
export const staticCharacterSchema = object<StaticCharacter>({
    characterId: characterIdSchema,
    playerId: playerIdSchema,
    characterRole: characterRoleSchema,
    defaultSpellId: spellIdSchema
});

export module CharacterUtils {
    export const isAlive = (health: number) => health > 0;
}
