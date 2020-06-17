import { CharacterFeatures, CharacterRoom, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { Immutable } from 'immer';

export type Character = {
    id: string;
    staticData: Readonly<StaticCharacter>;
    position: Readonly<Position>;
    orientation: Orientation;
    features: CharacterFeatures;

    playerId: string;
};

export const characterToSnapshot = ({ id, staticData, position, orientation, features, playerId }: Immutable<Character>): CharacterSnapshot => ({
    id,
    staticData: staticData as StaticCharacter,
    position: { ...position },
    orientation,
    features: { ...features },
    playerId
});

export const characterAlterLife = ({ features }: Character, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: Immutable<Character>) => character.features.life > 0;

export const Character = (
    { id, position }: Pick<CharacterRoom, 'id' | 'position'>,
    staticData: StaticCharacter,
    playerId: string,
): Character => {
    return {
        id,
        staticData,
        position,
        orientation: 'bottom', // should be calculated (?)
        features: { ...staticData.initialFeatures },
        playerId
    };

    // let features: Readonly<CharacterFeatures> = {
    //     ...staticData.initialFeatures
    // };

    // let orientation: Orientation = 'bottom'; // should be calculated (?)
    // let position: Position = { ...initialPosition };

    // const this_: Character = {
    //     get id(): string {
    //         return staticData.id;
    //     },
    //     staticData,
    //     player,
    //     get isAlive(): boolean {
    //         return features.life > 0;
    //     },
    //     get features() {
    //         return features;
    //     },
    //     set features(f) {
    //         features = f;
    //     },
    //     get orientation() {
    //         return orientation;
    //     },
    //     set orientation(o) {
    //         orientation = o;
    //     },
    //     get position() {
    //         return position;
    //     },
    //     set position(p) {
    //         position = p;
    //     },
    //     get spells() {
    //         return spells;
    //     },
    //     alterLife(add) {
    //         const life = Math.max(features.life + add, 0);
    //         features = { ...features, life };
    //     },
    //     toSnapshot() {
    //         return {
    //             id: staticData.id,
    //             staticData,
    //             features,
    //             orientation,
    //             position,
    //             spellsSnapshots: this.spells.map(s => s.toSnapshot())
    //         };
    //     },
    //     updateFromSnapshot(snapshot) {
    //         features = { ...snapshot.features };
    //         orientation = snapshot.orientation;
    //         position = snapshot.position;

    //         spells.forEach(spell => spell.updateFromSnapshot(
    //             snapshot.spellsSnapshots.find(snap => snap.id === spell.id)!
    //         ));
    //     }
    // };

    // const spells = staticData.staticSpells.map((s, i) => spellCreator(s, i + 1, this_));

    // return this_;
}
