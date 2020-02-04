import { SpellSnapshot, StaticSpell } from "./SpellSnapshot";

export type Orientation = 'left' | 'right' | 'top' | 'bottom';

export interface Position {

    x: number;

    y: number;
}

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

export interface CharacterSnapshot {
    readonly staticData: Readonly<StaticCharacter>;
    position: Position;
    orientation: Orientation;
    readonly features: CharacterFeatures;
    spellsSnapshots: SpellSnapshot[];
}
