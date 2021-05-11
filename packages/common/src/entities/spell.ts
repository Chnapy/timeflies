import { inferFn, ObjectTyped } from '../utils';
import { CharacterId } from './character';

export type SpellId = string;

export type SpellCategory = 'offensive' | 'support' | 'placement';

const spellRoleMap = inferFn<{
    [role in string]: SpellCategory;
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

export const spellRoleList = ObjectTyped.keys(spellRoleMap);

export type SpellRole = typeof spellRoleList[ number ];

export type SpellVariables = {
    duration: number;
    lineOfSight: boolean;
    rangeArea: number;
    actionArea: number;

    attack?: number;
    // more..
};

export type SpellVariableName = keyof SpellVariables;

export type SpellVariablesInnerMap<N extends SpellVariableName> = {
    [ spellId in SpellId ]: SpellVariables[ N ];
};

export type SpellVariablesMap = {
    [ name in SpellVariableName ]: SpellVariablesInnerMap<name>;
};

export type StaticSpell = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
};

export const getSpellCategory = (spellRole: SpellRole): SpellCategory => spellRoleMap[spellRole];
