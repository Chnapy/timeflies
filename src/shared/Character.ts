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

    staticData: StaticCharacter;

    player: BPlayer;

    position: Position;

    orientation: Orientation;

    features: CharacterFeatures;

    spells: BSpell[];

    constructor(staticData: StaticCharacter, player: BPlayer) {
        this.staticData = staticData;
        this.player = player;

        this.features = {
            ...staticData.initialFeatures
        };
        this.orientation = 'bottom'; // should be calculated
        this.position = { x: -1, y: -1 }; // same

        this.spells = staticData.staticSpells.map(ss => new BSpell(ss, this));
    }
}

export interface CharacterSnapshot extends Omit<BCharacter, 'player' | 'spells'> {
    spellsSnapshots: SpellSnapshot[];
}
