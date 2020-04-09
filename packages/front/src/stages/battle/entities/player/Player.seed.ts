import { PlayerSnapshot } from '@timeflies/shared';
import { SeedCharacterProps, seedCharacterSnapshot, seedCharacter } from '../character/Character.seed';
import { Player, PlayerDependencies } from './Player';
import { Team } from '../team/Team';
import { SeedPeriodicProps } from '../PeriodicEntity';
import { BattleDataPeriod } from '../../../../BattleData';

export interface SeedPlayerProps {
    id: string;
    name?: string;
    seedCharacters?: SeedCharacterProps<'features'>[],
}

export const seedInitialSeedCharactersSnapshot: SeedCharacterProps<'features'>[] = [ {
    id: 'c-1',
    seedSpells: [ { id: 's-1', type: 'move' } ]
} ];

export const seedPlayerSnapshot = ({ id, name, seedCharacters }: SeedPlayerProps): PlayerSnapshot => {

    return {
        id,
        name: name ?? 'P-' + id,
        charactersSnapshots: (seedCharacters ?? seedInitialSeedCharactersSnapshot).map(seedCharacterSnapshot)
    };
};

export interface SeedPlayerFullProps<P extends BattleDataPeriod> extends SeedPlayerProps {
    team: Team<P> | null;
    itsMe?: boolean;
    dependencies?: PlayerDependencies;
}

export const seedPlayer = <P extends BattleDataPeriod>(type: 'real' | 'fake', props: SeedPlayerFullProps<P> & SeedPeriodicProps<P>): Player<P> => {

    const { period, id, name, itsMe, seedCharacters, team, dependencies } = props;

    if (type === 'real') {
        return Player(
            period,
            seedPlayerSnapshot(props),
            team as Team<P>,
            dependencies
        );
    }

    const player: Player<P> = {
        period,
        id,
        itsMe: itsMe ?? true,
        name: name ?? 'P-' + id,
        characters: (seedCharacters ?? seedInitialSeedCharactersSnapshot).map(c => seedCharacter('fake', {
            ...c,
            period,
            initialFeatures: c.features,
            player
        })),
        team: team as Team<P>,
        getSnapshot() { return seedPlayerSnapshot(props); },
        updateFromSnapshot(snapshot) { }
    };

    return player;
};
