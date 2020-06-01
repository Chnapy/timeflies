import { Orientation, Position } from '../geo';
import { SpellSnapshot, StaticSpell } from "./Spell";

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export interface CharacterFeatures {
    life: number;
    actionTime: number;
}

export interface StaticCharacter {
    id: string;
    name: string;
    type: CharacterType;
    initialFeatures: CharacterFeatures;
    staticSpells: StaticSpell[];
    defaultSpellId: string;
}

export type CharacterSnapshot = {
    id: string;
    playerId: string;
    staticData: Readonly<StaticCharacter>;
    position: Position;
    orientation: Orientation;
    features: CharacterFeatures;
};

export interface CharacterRoom {
    readonly id: string;
    readonly type: CharacterType;
    position: Position;
}
