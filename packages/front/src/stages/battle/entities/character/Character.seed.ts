import { RequiredOnly, CharacterFeatures, CharacterRole, CharacterSnapshot, createPosition } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Character } from './Character';

export type SeedCharacterProps<P extends BattleDataPeriod> = Omit<RequiredOnly<Character<P>, 'id' | 'period'>, 'features'> & {
    type?: CharacterRole;
    features?: Partial<CharacterFeatures>;
};

export type SeedCharacterSnapshotProps = Omit<RequiredOnly<CharacterSnapshot, 'id'>, 'features'> & {
    type?: CharacterRole;
    features?: Partial<CharacterFeatures>;
};

export const seedCharacterSnapshot = ({ type, features, ...props }: SeedCharacterSnapshotProps): CharacterSnapshot => ({
    playerId: '',
    staticData: {
        id: props.id,
        name: 'name',
        role: type ?? 'sampleChar1',
        initialFeatures: {
            life: 100,
            actionTime: 2000,
            ...features
        },
        staticSpells: [ {
            id: 's1',
            role: 'move',
            name: 'name',
            initialFeatures: {
                rangeArea: 2,
                attack: 2,
                duration: 1000
            }
        } ],
        defaultSpellId: 's1'
    },
    position: createPosition(4, 3),
    orientation: 'bottom',
    features: {
        life: 100,
        actionTime: 2000,
        ...features
    },
    ...props
});

export const seedCharacter = <P extends BattleDataPeriod>({ type, features, ...props }: SeedCharacterProps<P>): Character<P> => {

    return {
        playerId: '',
        isMine: false,
        staticData: {
            id: props.id,
            name: 'name',
            role: type ?? 'sampleChar1',
            initialFeatures: {
                life: 100,
                actionTime: 2000,
                ...features
            },
            staticSpells: [ {
                id: 's1',
                role: 'move',
                name: 'name',
                initialFeatures: {
                    rangeArea: 2,
                    attack: 2,
                    duration: 1000
                }
            } ],
            defaultSpellId: props.defaultSpellId ?? 's1'
        },
        position: createPosition(4, 3),
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
