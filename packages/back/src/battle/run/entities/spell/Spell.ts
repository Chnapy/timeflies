import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { Character } from "../character/Character";
import { Entity } from '../Entity';

export interface Spell extends Entity<SpellSnapshot> {
    readonly staticData: Readonly<StaticSpell>;
    readonly character: Character;
    readonly features: SpellFeatures;
}

export const Spell = (staticData: StaticSpell, index: number, character: Character): Spell => {

    let features: Readonly<SpellFeatures> = {
        ...staticData.initialFeatures
    };

    return {
        id: staticData.id,
        staticData,
        character,
        get features() {
            return features;
        },
        toSnapshot(): SpellSnapshot {
            return {
                id: staticData.id,
                index,
                staticData,
                features
            };
        },
        updateFromSnapshot(snapshot) {
            features = { ...snapshot.features };
        }
    };
}
