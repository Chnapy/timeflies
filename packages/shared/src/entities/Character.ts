import { Orientation, Position } from '../geo';
import { StaticSpell } from "./Spell";
import { cloneByJSON } from '../util';
import { DeepReadonly } from '../types';

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export type CharacterFeatures = {
    life: number;
    actionTime: number;
};

export type CharacterEntity = {
    id: string;
    staticData: Readonly<StaticCharacter>;
    position: Readonly<Position>;
    orientation: Orientation;
    features: CharacterFeatures;

    playerId: string;
};

export type StaticCharacter = {
    id: string;
    name: string;
    type: CharacterType;
    initialFeatures: CharacterFeatures;
    staticSpells: StaticSpell[];
    defaultSpellId: string;
};

export type CharacterSnapshot = {
    id: string;
    playerId: string;
    staticData: StaticCharacter;
    position: Position;
    orientation: Orientation;
    features: CharacterFeatures;
};

export type CharacterRoom = {
    readonly id: string;
    readonly type: CharacterType;
    position: Position;
};

export const characterEntityToSnapshot = (entity: CharacterEntity | DeepReadonly<CharacterEntity>): CharacterSnapshot => {
    const { id, staticData, position, orientation, features, playerId } = cloneByJSON(entity);

    return {
        id,
        staticData: staticData as StaticCharacter,
        position,
        orientation,
        features,
        playerId
    };
};

export const characterAlterLife = ({ features }: CharacterEntity, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: CharacterEntity | DeepReadonly<CharacterEntity>) => character.features.life > 0;
