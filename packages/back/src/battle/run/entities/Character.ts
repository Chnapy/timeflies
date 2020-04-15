import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { Player } from "./Player";
import { Spell } from "./Spell";

export interface Character {
    readonly id: string;
    readonly staticData: Readonly<StaticCharacter>;
    readonly player: Player;
    position: Readonly<Position>;
    orientation: Orientation;
    features: Readonly<CharacterFeatures>;
    readonly spells: readonly Spell[];
    readonly isAlive: boolean;
    alterLife(add: number): void;
    toSnapshot(): CharacterSnapshot
}

export const Character = (staticData: StaticCharacter, player: Player): Character => {

    let features: Readonly<CharacterFeatures> = {
        ...staticData.initialFeatures
    };

    let orientation: Orientation = 'bottom'; // should be calculated (?)
    let position: Position = { x: -1, y: -1 }; // same

    const this_: Character = {
        get id(): string {
            return staticData.id;
        },
        staticData,
        player,
        get isAlive(): boolean {
            return features.life > 0;
        },
        get features() {
            return features;
        },
        set features(f) {
            features = f;
        },
        get orientation() {
            return orientation;
        },
        set orientation(o) {
            orientation = o;
        },
        get position() {
            return position;
        },
        set position(p) {
            position = p;
        },
        get spells() {
            return spells;
        },
        alterLife(add) {
            const life = Math.max(features.life + add, 0);
            features = { ...features, life };
        },
        toSnapshot() {
            return {
                id: staticData.id,
                staticData,
                features,
                orientation,
                position,
                spellsSnapshots: this.spells.map(s => s.toSnapshot())
            };
        }
    };

    const spells = staticData.staticSpells.map(s => Spell(s, this_));

    return this_;
}
