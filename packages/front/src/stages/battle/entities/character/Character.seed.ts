import { RequiredOnly, CharacterFeatures } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Character } from './Character';

export type SeedCharacterProps<P extends BattleDataPeriod> = Omit<RequiredOnly<Character<P>, 'id' | 'period'>, 'features'> & {
    features?: Partial<CharacterFeatures>;
};

export const seedCharacter = <P extends BattleDataPeriod>({ features, ...props }: SeedCharacterProps<P>): Character<P> => {

    return {
        playerId: '',
        staticData: {
            id: props.id,
            name: 'name',
            type: 'sampleChar1',
            initialFeatures: {
                life: 100,
                actionTime: 2000,
                ...features
            },
            staticSpells: [],
            defaultSpellId: props.defaultSpellId ?? ''
        },
        position: { x: 4, y: 3 },
        orientation: 'bottom',
        defaultSpellId: '',
        features: {
            life: 100,
            actionTime: 2000,
            ...features
        },
        ...props
    };
};
