import * as joi from 'joi';
import { ObjectTyped } from '../utils';
import { inferFn } from '../utils/inferFn';

export type CharacterId = string;
export const characterIdSchema = joi.string().required().min(1);

export type CharacterDuration = number;
export const characterDurationSchema = joi.number().required().integer().min(0);

export type CharacterCategory = typeof characterCategoryList[ number ];
export const characterCategoryList = [ 'offensive', 'support', 'placement' ] as const;
export const characterCategorySchema = characterCategoryList;

const characterRoleMap = inferFn<{
    [ role in string ]: CharacterCategory;
}>()({
    'tacka': 'offensive',
    'vemo': 'placement',
    'meti': 'support'
});

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = ObjectTyped.keys(characterRoleMap);
export const characterRoleSchema = characterRoleList;

export const getCharacterCategory = (characterRole: CharacterRole): CharacterCategory => characterRoleMap[ characterRole ];
