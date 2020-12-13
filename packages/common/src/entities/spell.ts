
export type SpellId = string;

export type SpellCategory = 'offensive' | 'support' | 'placement';

export type SpellRole =
    | 'move'
    | 'simpleAttack'    // testing
    | 'switch'
    // | 'incitement'
    // | 'treacherousBlow'
    // | 'pressure'
    // | 'healthSharing'
    // | 'sacrificialGift'
    // | 'attentionAttraction'
    // | 'slump'
    // | 'lastResort'
    // | 'motivation'
    ;

export type SpellVariables = {
    duration: number;
    lineOfSight: boolean;
    rangeArea: number;
    actionArea: number;

    attack?: number;
    // more..
};
