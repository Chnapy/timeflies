import { SpellFeatures, SpellSnapshot, SpellType, StaticSpell } from '@timeflies/shared';
import { Character } from '../character/Character';
import { Spell } from './Spell';
import { BattleDataPeriod } from '../../../../BattleData';
import { SeedPeriodicProps } from '../PeriodicEntity';

export type SeedSpellProps<FK extends 'features' | 'initialFeatures' = 'initialFeatures'> = {
    id: string;
    index?: number;
    type: SpellType;
    name?: string;
} & { [ k in FK ]?: Partial<SpellFeatures> };

export const seedSpellFeatures = (features: Partial<SpellFeatures> = {}): SpellFeatures => ({
    area: 1,
    attack: -1,
    duration: 200,
    ...features
});

export const seedSpellStaticData = ({ id, type, name, initialFeatures }: SeedSpellProps): StaticSpell => {

    return {
        id,
        type,
        name: name ?? 'S-' + id,
        initialFeatures: seedSpellFeatures(initialFeatures)
    };
};

export const seedSpellSnapshot = (props: SeedSpellProps<'features'>): SpellSnapshot => {
    const { id, index, features } = props;

    return {
        id,
        index: index ?? 1,
        features: seedSpellFeatures(features),
        staticData: seedSpellStaticData({
            ...props,
            initialFeatures: features
        })
    };
};

export const seedSpell = <P extends BattleDataPeriod>(type: 'real' | 'fake', props: SeedSpellProps & SeedPeriodicProps<P> & Record<'character', Character<P>>): Spell<P> => {
    const { id, index, character, initialFeatures } = props;

    if (type === 'real') {
        return Spell(props.period, seedSpellSnapshot({
            ...props,
            features: initialFeatures
        }), character);
    }

    const spell: Spell<P> = {
        period: props.period,
        id,
        index: index ?? 1,
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
