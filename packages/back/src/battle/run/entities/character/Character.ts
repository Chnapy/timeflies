import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { Player } from "../player/Player";
import { Spell } from "../spell/Spell";
import { Entity } from '../Entity';

export interface Character extends Entity<CharacterSnapshot> {
    readonly staticData: Readonly<StaticCharacter>;
    readonly player: Player;
    position: Readonly<Position>;
    orientation: Orientation;
    features: Readonly<CharacterFeatures>;
    readonly spells: readonly Spell[];
    readonly isAlive: boolean;
    alterLife(add: number): void;
}

interface Dependencies {
    spellCreator: typeof Spell;
}

export const Character = (
    staticData: StaticCharacter, initialPosition: Position,
    player: Player,
    { spellCreator }: Dependencies = { spellCreator: Spell }
): Character => {

    let features: Readonly<CharacterFeatures> = {
        ...staticData.initialFeatures
    };

    let orientation: Orientation = 'bottom'; // should be calculated (?)
    let position: Position = { ...initialPosition };

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
        },
        updateFromSnapshot(snapshot) {
            features = { ...snapshot.features };
            orientation = snapshot.orientation;
            position = snapshot.position;

            spells.forEach(spell => spell.updateFromSnapshot(
                snapshot.spellsSnapshots.find(snap => snap.id === spell.id)!
            ));
        }
    };

    const spells = staticData.staticSpells.map(s => spellCreator(s, this_));

    return this_;
}
