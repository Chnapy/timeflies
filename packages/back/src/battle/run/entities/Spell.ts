import { SpellFeatures, SpellSnapshot, StaticSpell } from '@timeflies/shared';
import { Character } from "./Character";

export interface Spell {
    readonly id: string;
    readonly staticData: Readonly<StaticSpell>;
    readonly character: Character;
    readonly features: SpellFeatures;
    toSnapshot(): SpellSnapshot;
}

export const Spell = (staticData: StaticSpell, character: Character): Spell => {

    let features: Readonly<SpellFeatures> = {
        ...staticData.initialFeatures
    };

    return {
        get id(): string {
            return staticData.id;
        },
        staticData,
        character,
        get features() {
            return features;
        },
        toSnapshot(): SpellSnapshot {
            return {
                id: staticData.id,
                staticData,
                features
            };
        }
    };
}
