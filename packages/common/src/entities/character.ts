import { Orientation, Position } from '../geo';
import { PlayerId } from './player';
import { SpellId } from './spell';

export type CharacterId = string;

export type CharacterDuration = number;

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = [
    'vemo', 'tacka', 'meti'
] as const;

export type CharacterVariables = {
    health: number;
    actionTime: number;
    position: Position;
    orientation: Orientation;
};

export type CharacterVariableName = keyof CharacterVariables;

export type CharacterVariablesInnerMap<N extends CharacterVariableName> = {
    [ characterId in CharacterId ]: CharacterVariables[ N ];
};

export type CharacterVariablesMap = {
    [ name in CharacterVariableName ]: CharacterVariablesInnerMap<name>;
};

export type StaticCharacter = {
    characterId: CharacterId;
    playerId: PlayerId;
    characterRole: CharacterRole;
    defaultSpellId: SpellId;
};

export module CharacterUtils {
    export const isAlive = (health: number) => health > 0;
}
