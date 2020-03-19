import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { Character } from './Character';
import { WithSnapshot } from './WithSnapshot';

export interface Spell extends WithSnapshot<SpellSnapshot> {
    readonly id: string;
    readonly staticData: Readonly<StaticSpell>;
    readonly feature: Readonly<SpellFeatures>;
    readonly character: Character;
}

export const Spell = ({ staticData, features: _features }: SpellSnapshot, character: Character): Spell => {

    let features: Readonly<SpellFeatures> = { ..._features };

    return {
        get id(): string {
            return staticData.id;
        },
        staticData,
        get feature(): Readonly<SpellFeatures> {
            return features;
        },
        character,

        getSnapshot(): SpellSnapshot {
            return {
                id: staticData.id,
                staticData,
                features: { ...features }
            };
        },

        updateFromSnapshot(snapshot: SpellSnapshot) {
        }
    }
};
