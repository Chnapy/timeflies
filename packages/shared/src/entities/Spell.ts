import { Position } from '../geo/position';
import { Normalized } from '../util/normalize';

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

export type SpellSnapshot = {
    id: string;
    characterId: string;
    index: number;
    staticData: Readonly<StaticSpell>;
    features: SpellFeatures;
};

export interface SpellActionSnapshot {
    startTime: number;
    characterId: string;
    duration: number;
    spellId: string;
    position: Position;
    actionArea: Normalized<Position>;
    battleHash: string;
}
