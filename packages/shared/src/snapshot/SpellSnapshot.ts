
export type SpellType =
    | 'move'
    | 'orientate'
    | 'sampleSpell1'
    | 'sampleSpell2'
    | 'sampleSpell3';

export interface SpellFeatures {
    duration: number;
    attack: number;
    area: number;
}

export interface StaticSpell {
    id: string;
    name: string;
    type: SpellType;
    color: string;
    initialFeatures: SpellFeatures;
}

export interface SpellSnapshot {
    readonly staticData: Readonly<StaticSpell>;
    readonly features: SpellFeatures;
}
