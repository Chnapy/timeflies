import { BPlayer } from "./Player";
import { BSpell, SpellSnapshot, StaticSpell } from "./Spell";

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

export class BCharacter {

    get id(): string {
        return this.staticData.id;
    }

    readonly staticData: Readonly<StaticCharacter>;

    readonly player: BPlayer;

    position: Position;

    orientation: Orientation;

    readonly features: CharacterFeatures;

    readonly spells: readonly BSpell[];

    get isAlive(): boolean {
        return this.features.life > 0;
    }

    constructor(staticData: StaticCharacter, player: BPlayer) {
        this.staticData = staticData;
        this.player = player;

        this.features = {
            ...staticData.initialFeatures
        };
        this.orientation = 'bottom'; // should be calculated (?)
        this.position = { x: -1, y: -1 }; // same

        this.spells = staticData.staticSpells.map(ss => new BSpell(ss, this));
    }

    toSnapshot(): CharacterSnapshot {
        return {
            staticData: this.staticData,
            features: this.features,
            orientation: this.orientation,
            position: this.position,
            spellsSnapshots: this.spells.map(s => s.toSnapshot())
        }
    }
}

export interface CharacterSnapshot {
    readonly staticData: Readonly<StaticCharacter>;
    position: Position;
    orientation: Orientation;
    readonly features: CharacterFeatures;
    spellsSnapshots: SpellSnapshot[];
}
