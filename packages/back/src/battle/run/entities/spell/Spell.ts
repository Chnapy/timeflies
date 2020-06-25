import { SpellFeatures, StaticSpell, SpellSnapshot } from '@timeflies/shared';

export type Spell = {
    id: string;
    staticData: Readonly<StaticSpell>;
    index: number;
    features: SpellFeatures;
    characterId: string;
};

export const spellToSnapshot = ({ id, staticData, index, features, characterId }: Spell): SpellSnapshot => ({
    id,
    staticData,
    index,
    features,
    characterId
});

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
