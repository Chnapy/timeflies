import { Position } from '../geo/position';

export type SpellType =
    | 'move'
    // | 'orientate'
    | 'simpleAttack';

export interface SpellFeatures {
    duration: number;
    attack: number;
    area: number;
}

export interface StaticSpell {
    id: string;
    name: string;
    type: SpellType;
    initialFeatures: SpellFeatures;
}

export interface SpellSnapshot {
    readonly id: string;
    readonly index: number;
    readonly staticData: Readonly<StaticSpell>;
    readonly features: SpellFeatures;
}

export interface SpellActionSnapshot {
    startTime: number;
    characterId: string;
    duration: number;
    spellId: string;
    position: Position;
    actionArea: Position[];
    battleHash: string;
}
