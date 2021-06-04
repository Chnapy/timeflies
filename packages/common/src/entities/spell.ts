import * as joi from 'joi';
import { SchemaMapRequired } from 'joi';
import { inferFn } from '../utils/inferFn';
import { ObjectTyped } from '../utils/object';
import { CharacterId, characterIdSchema } from './character-basics';

export type SpellId = string;
export const spellIdSchema = joi.string().required().min(1);

export type SpellCategory = typeof spellCategoryList[ number ];
export const spellCategoryList = [ 'offensive', 'support', 'placement' ] as const;
export const spellCategorySchema = spellCategoryList;

const spellRoleMap = inferFn<{
    [ role in string ]: SpellCategory;
}>()({
    'move': 'placement',
    'simpleAttack': 'offensive',    // testing only
    'switch': 'placement',
    // | 'incitement'
    // | 'treacherousBlow'
    // | 'pressure'
    // | 'healthSharing'
    // | 'sacrificialGift'
    // | 'attentionAttraction'
    // | 'slump'
    // | 'lastResort'
    // | 'motivation'
});

export type SpellRole = typeof spellRoleList[ number ];
export const spellRoleList = ObjectTyped.keys(spellRoleMap);
export const spellRoleSchema = spellRoleList;

export type SpellVariables = {
    duration: number;
    lineOfSight: boolean;
    rangeArea: number;
    actionArea: number;

    attack?: number;
    // more..
};
const spellvariablesSchemaContent: SchemaMapRequired<SpellVariables> = {
    duration: joi.number().required().integer().min(0),
    lineOfSight: joi.boolean().required(),
    rangeArea: joi.number().required().integer().min(0),
    actionArea: joi.number().required().integer().min(0),
    attack: joi.number().required().integer()
};
export const spellVariablesSchema = joi.object<SpellVariables>(spellvariablesSchemaContent);

export type SpellVariableName = keyof SpellVariables;
export const spellVariableNameSchema = ObjectTyped.keys(spellvariablesSchemaContent);

export type SpellVariablesInnerMap<N extends SpellVariableName> = {
    [ spellId in SpellId ]: SpellVariables[ N ];
};
export const spellVariablesInnerMapSchema = joi.object<SpellVariablesInnerMap<SpellVariableName>>({})
    .pattern(spellIdSchema, joi.any());

export type SpellVariablesMap = {
    [ name in SpellVariableName ]: SpellVariablesInnerMap<name>;
};
export const spellVariablesMapSchema = joi.object<SpellVariablesInnerMap<SpellVariableName>>({})
    .pattern(spellVariableNameSchema, spellVariablesInnerMapSchema);

export type StaticSpell = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
};
export const staticSpellSchema = joi.object<StaticSpell>({
    spellId: spellIdSchema,
    characterId: characterIdSchema,
    spellRole: spellRoleSchema
});

export const getSpellCategory = (spellRole: SpellRole): SpellCategory => spellRoleMap[ spellRole ];
