import { Position } from '../geo/position';
import { Normalized } from '../util/normalize';
import { cloneByJSON } from '../util';

export type SpellRole =
    | 'move'
    // | 'orientate'
    | 'simpleAttack';

export type SpellFeatures = {
    duration: number;
    attack: number;
    area: number;
};
 
export type SpellEntity = {
    id: string;
    staticData: Readonly<StaticSpell>;
    index: number;
    features: SpellFeatures;
    characterId: string;
};

export type StaticSpell = {
    id: string;
    name: string;
    role: SpellRole;
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

export const spellEntityToSnapshot = (entity: SpellEntity): SpellSnapshot => {

    const { id, staticData, index, features, characterId } = cloneByJSON(entity);

    return {
        id,
        staticData,
        index,
        features,
        characterId
    };
};
