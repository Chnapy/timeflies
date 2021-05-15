import * as joi from 'joi';

export type CharacterId = string;
export const characterIdSchema = joi.string().required().min(1);

export type CharacterDuration = number;
export const characterDurationSchema = joi.number().required().integer().min(0);

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = [
    'vemo', 'tacka', 'meti'
] as const;
export const characterRoleSchema = characterRoleList;
