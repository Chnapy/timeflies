import { any, boolean, number, object, string } from 'joi';
import { inferFn, ObjectTyped } from '../utils';
import { CharacterId, characterIdSchema } from './character';

export type SpellId = string;
export const spellIdSchema = string().required().min(1);

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
export const spellVariablesSchema = object<SpellVariables>({
    duration: number().required().integer().min(0),
    lineOfSight: boolean().required(),
    rangeArea: number().required().integer().min(0),
    actionArea: number().required().integer().min(0),
    attack: number().required().integer()
});

export type SpellVariableName = keyof SpellVariables;
export const spellVariableNameSchema = ObjectTyped.keys(spellVariablesSchema.describe().keys) as SpellVariableName[];

export type SpellVariablesInnerMap<N extends SpellVariableName> = {
    [ spellId in SpellId ]: SpellVariables[ N ];
};
export const spellVariablesInnerMapSchema = object<SpellVariablesInnerMap<SpellVariableName>>({})
    .pattern(spellIdSchema, any());

export type SpellVariablesMap = {
    [ name in SpellVariableName ]: SpellVariablesInnerMap<name>;
};
export const spellVariablesMapSchema = object<SpellVariablesInnerMap<SpellVariableName>>({})
    .pattern(spellVariableNameSchema, spellVariablesInnerMapSchema);

export type StaticSpell = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
};
export const staticSpellSchema = object<StaticSpell>({
    spellId: spellIdSchema,
    characterId: characterIdSchema,
    spellRole: spellRoleSchema
});

export const getSpellCategory = (spellRole: SpellRole): SpellCategory => spellRoleMap[ spellRole ];
