import { RequiredOnly, SpellType } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Spell } from './Spell';

export type SeedSpellProps<P extends BattleDataPeriod> = Omit<RequiredOnly<Spell<P>, 'id' | 'period'>, 'feature'> & { 
    type?: SpellType;
    feature?: Partial<Spell<P>['feature']>;
};

export const seedSpell = <P extends BattleDataPeriod>({ type, feature, ...props }: SeedSpellProps<P>): Spell<P> => {

    return {
        characterId: '',
        staticData: {
            id: props.id,
            name: 'name',
            type: type ?? 'move',
            initialFeatures: {
                area: 3,
                attack: 10,
                duration: 1000,
                ...feature
            }
        },
        index: 1,
        feature: {
            area: 3,
            attack: 10,
            duration: 1000,
            ...feature
        },
        ...props
    };
};
