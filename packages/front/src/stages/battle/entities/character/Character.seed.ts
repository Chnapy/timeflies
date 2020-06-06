import { RequiredOnly, CharacterFeatures, CharacterType } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Character } from './Character';

export type SeedCharacterProps<P extends BattleDataPeriod> = Omit<RequiredOnly<Character<P>, 'id' | 'period'>, 'features'> & {
    type?: CharacterType;
    features?: Partial<CharacterFeatures>;
};

export const seedCharacter = <P extends BattleDataPeriod>({ type, features, ...props }: SeedCharacterProps<P>): Character<P> => {

    return {
        playerId: '',
        staticData: {
            id: props.id,
            name: 'name',
            type: type ?? 'sampleChar1',
            initialFeatures: {
                life: 100,
                actionTime: 2000,
                ...features
            },
            staticSpells: [ {
                id: 's1',
                type: 'move',
                name: 'name',
                initialFeatures: {
                    area: 2,
                    attack: 2,
                    duration: 1000
                }
            } ],
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
