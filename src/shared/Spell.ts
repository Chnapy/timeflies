import { BCharacter } from "./Character";
import { OmitFn } from "../types/global";

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

export class BSpell {

    readonly staticData: Readonly<StaticSpell>;

    readonly character: BCharacter;

    readonly features: SpellFeatures;

    constructor(staticData: StaticSpell, character: BCharacter) {
        this.staticData = staticData;
        this.character = character;
        this.features = {
            ...staticData.initialFeatures
        };
    }

    toSnapshot(): SpellSnapshot {
        return {
            staticData: this.staticData,
            features: this.features
        };
    }
}

export interface SpellSnapshot extends OmitFn<BSpell, 'character'> {
}
