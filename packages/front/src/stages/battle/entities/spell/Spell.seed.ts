import { SpellFeatures, SpellSnapshot, SpellType, StaticSpell } from '@timeflies/shared';
import { Character } from '../character/Character';
import { Spell } from './Spell';

export type SeedSpellProps<FK extends 'features' | 'initialFeatures' = 'initialFeatures'> = {
    id: string;
    type: SpellType;
    name?: string;
    color?: string;
} & { [ k in FK ]?: Partial<SpellFeatures> };

export const seedSpellFeatures = (features: Partial<SpellFeatures> = {}): SpellFeatures => ({
    area: 1,
    attack: -1,
    duration: 200,
    ...features
});

export const seedSpellStaticData = ({ id, type, name, color, initialFeatures }: SeedSpellProps): StaticSpell => {

    return {
        id,
        type,
        name: name ?? 'S-' + id,
        color: color ?? 'red',
        initialFeatures: seedSpellFeatures(initialFeatures)
    };
};

export const seedSpellSnapshot = (props: SeedSpellProps<'features'>): SpellSnapshot => {
    const { id, features } = props;

    return {
        id,
        features: seedSpellFeatures(features),
        staticData: seedSpellStaticData({
            ...props,
            initialFeatures: features
        })
    };
};

export const seedSpell = (type: 'real' | 'fake', props: SeedSpellProps & Record<'character', Character>): Spell => {
    const { id, character, initialFeatures } = props;

    if (type === 'real') {
        return Spell(seedSpellSnapshot({
            ...props,
            features: initialFeatures
        }), character);
    }

    const spell: Spell = {
        id,
        character,
        feature: seedSpellFeatures(initialFeatures),
        staticData: seedSpellStaticData(props),
        getSnapshot() {
            return seedSpellSnapshot({
                ...props,
                features: spell.feature
            });
        },
        updateFromSnapshot(snapshot) { }
    };
    return spell;
};
