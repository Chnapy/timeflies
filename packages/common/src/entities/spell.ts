
export type SpellId = string;

export type SpellCategory = 'offensive' | 'support' | 'placement';

export const spellRoleList = [
    'move',
    'simpleAttack',     // testing only
    'switch',
// | 'incitement'
// | 'treacherousBlow'
// | 'pressure'
// | 'healthSharing'
// | 'sacrificialGift'
// | 'attentionAttraction'
// | 'slump'
// | 'lastResort'
// | 'motivation'
] as const;
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
