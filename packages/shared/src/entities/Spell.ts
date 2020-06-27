import { Position } from '../geo/position';
import { Normalized } from '../util/normalize';

export type SpellType =
    | 'move'
    // | 'orientate'
    | 'simpleAttack';

export type SpellFeatures = {
    duration: number;
    attack: number;
    area: number;
};

export type StaticSpell = {
    id: string;
    name: string;
    type: SpellType;
    initialFeatures: SpellFeatures;
};

export type SpellSnapshot = {
    id: string;
    characterId: string;
    index: number;
    staticData: Readonly<StaticSpell>;
    features: SpellFeatures;
};

export type SpellActionSnapshot = {
    startTime: number;
    characterId: string;
    duration: number;
    spellId: string;
    position: Position;
    actionArea: Normalized<Position>;
    battleHash: string;
};
