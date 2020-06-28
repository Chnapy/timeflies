import { SpellEntity, StaticSpell } from '@timeflies/shared';

// should not use entity directly, for future updates
export type Spell = SpellEntity;

export const Spell = (
    staticData: StaticSpell, index: number, characterId: string): Spell => {

    return {
        id: staticData.id,
        staticData,
        index,
        features: {
            ...staticData.initialFeatures
        },
        characterId
    };
};
