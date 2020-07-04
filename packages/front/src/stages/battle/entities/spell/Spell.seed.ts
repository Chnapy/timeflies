import { RequiredOnly, SpellSnapshot, SpellRole } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Spell } from './Spell';

export type SeedSpellProps<P extends BattleDataPeriod> = Omit<RequiredOnly<Spell<P>, 'id' | 'period'>, 'feature'> & {
    type?: SpellRole;
    feature?: Partial<Spell<P>[ 'features' ]>;
};

export type SeedSpellSnapshotProps = Omit<RequiredOnly<SpellSnapshot, 'id'>, 'features'> & {
    type?: SpellRole;
    feature?: Partial<SpellSnapshot[ 'features' ]>;
};

export const seedSpellSnapshot = ({ type = 'move', feature, ...props }: SeedSpellSnapshotProps): SpellSnapshot => ({
    characterId: '',
    staticData: {
        id: props.id,
        name: 'name',
        role: type,
        description: 'description ' + type,
        initialFeatures: {
            lineOfSight: true,
            rangeArea: 3,
            actionArea: 1,
            attack: 10,
            duration: 1000,
            ...feature
        }
    },
    index: 1,
    features: {
        lineOfSight: true,
        rangeArea: 3,
        actionArea: 1,
        attack: 10,
        duration: 1000,
        ...feature
    },
    ...props
});

export const seedSpell = <P extends BattleDataPeriod>({ type = 'move', feature, ...props }: SeedSpellProps<P>): Spell<P> => {

    return {
        characterId: '',
        staticData: {
            id: props.id,
            name: 'name',
            role: type,
            description: 'description ' + type,
            initialFeatures: {
                lineOfSight: true,
                rangeArea: 3,
                actionArea: 1,
                attack: 10,
                duration: 1000,
                ...feature
            }
        },
        index: 1,
        features: {
            lineOfSight: true,
            rangeArea: 3,
            actionArea: 1,
            attack: 10,
            duration: 1000,
            ...feature
        },
        ...props
    };
};
