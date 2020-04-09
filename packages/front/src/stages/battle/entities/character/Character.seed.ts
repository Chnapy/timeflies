import { CharacterFeatures, CharacterSnapshot, CharacterType, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { Player } from '../player/Player';
import { seedSpell, SeedSpellProps, seedSpellSnapshot, seedSpellStaticData } from '../spell/Spell.seed';
import { Character } from './Character';
import { BattleDataPeriod } from '../../../../BattleData';
import { SeedPeriodicProps } from '../PeriodicEntity';

export type SeedCharacterProps<FK extends 'features' | 'initialFeatures' = 'initialFeatures'> = {
    id: string;
    type?: CharacterType;
    seedSpells: SeedSpellProps[];
    defaultSpellId?: string;
    position?: Position;
    orientation?: Orientation;
} & { [ k in FK ]?: Partial<CharacterFeatures> };

export const seedCharacterInitialSeedSpells: SeedSpellProps[] = [ { id: 's1', type: 'move' } ];

export const seedCharacterInitialOrientation: Orientation = 'bottom';

export const seedCharacterInitialPosition: Position = { x: 4, y: 3 };

export const seedOrientation = (o?: Orientation): Orientation => o ?? seedCharacterInitialOrientation;

export const seedPosition = (p?: Position): Position => p ?? seedCharacterInitialPosition;

export const seedCharacterFeatures = (features: Partial<CharacterFeatures> = {}): CharacterFeatures => ({
    life: 100,
    actionTime: 2000,
    ...features
});

export const seedCharacterStaticData = (props: SeedCharacterProps): StaticCharacter => {
    const { id, type, initialFeatures, seedSpells, defaultSpellId } = props;

    return {
        id,
        name: 'name',
        type: type ?? 'sampleChar1',
        initialFeatures: seedCharacterFeatures(initialFeatures),
        staticSpells: seedSpells.map(seedSpellStaticData),
        defaultSpellId: defaultSpellId ?? seedSpells[ 0 ]?.id
    };
};

export const seedCharacterSnapshot = (props: SeedCharacterProps<'features'>): CharacterSnapshot => {
    const { id, features, seedSpells, position, orientation } = props;

    return {
        id,
        staticData: seedCharacterStaticData({
            ...props,
            initialFeatures: features
        }),
        features: seedCharacterFeatures(features),
        spellsSnapshots: seedSpells.map(s => seedSpellSnapshot({
            ...s,
            features: s.initialFeatures
        })),
        position: seedPosition(position),
        orientation: seedOrientation(orientation)
    };
};

type SeedCharacterExtraProps<P extends BattleDataPeriod> = {
    seedSpells?: SeedSpellProps[];
    isMine?: boolean;
    isAlive?: boolean;
    player: Player<P> | null;
};

export const seedCharacter = <P extends BattleDataPeriod>(type: 'real' | 'fake', props: Omit<SeedCharacterProps, 'seedSpells'> & SeedPeriodicProps<P> & SeedCharacterExtraProps<P>): Character<P> => {
    const { period, id, orientation, position, defaultSpellId, initialFeatures, player, isMine, isAlive } = props;
    const seedSpells = props.seedSpells ?? seedCharacterInitialSeedSpells;

    if (type === 'real') {
        return Character(period, seedCharacterSnapshot({
            ...props,
            seedSpells,
            defaultSpellId: defaultSpellId ?? seedSpells[ 0 ].id,
            features: initialFeatures
        }), player as Player<P>);
    }

    const character: Character<P> = {
        period,
        id,
        staticData: seedCharacterStaticData({ ...props, seedSpells }),
        isMine: isMine ?? true,
        isAlive: isAlive ?? true,
        position: seedPosition(position),
        orientation: seedOrientation(orientation),
        player: player as Player<P>,
        features: seedCharacterFeatures(initialFeatures),
        get spells() { return spells; },
        get defaultSpell() { return spells.find(s => s.id === defaultSpellId) ?? spells[ 0 ]; },
        getSnapshot() {
            return seedCharacterSnapshot({
                ...props,
                features: initialFeatures,
                seedSpells
            });
        },
        updateFromSnapshot(snapshot) { },
        hasSpell(spellType) { return false; },
        set(o) { }
    };

    const spells = seedSpells.map(s => seedSpell('fake', {
        ...s,
        period,
        character
    }));

    return character;
};
