import { PlayerSnapshot } from '@timeflies/shared';
import { SeedCharacterProps, seedCharacterSnapshot, seedCharacter } from '../character/Character.seed';
import { Player, PlayerDependencies } from './Player';
import { Team } from '../team/Team';

export type SeedPlayerProps = {
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

export interface SeedPlayerFullProps extends SeedPlayerProps {
    team: Team | null;
    itsMe?: boolean;
    dependencies?: PlayerDependencies;
}

export const seedPlayer = (type: 'real' | 'fake', props: SeedPlayerFullProps): Player => {

    if (type === 'real') {
        return Player(
            seedPlayerSnapshot(props),
            props.team as Team,
            props.dependencies
        );
    }
    const { id, name, itsMe, seedCharacters, team } = props;


    const player: Player = {
        id,
        itsMe: itsMe ?? true,
        name: name ?? 'P-' + id,
        characters: (seedCharacters ?? seedInitialSeedCharactersSnapshot).map(c => seedCharacter('fake', {
            ...c,
            initialFeatures: c.features,
            player
        })),
        team: team as Team,
        getSnapshot() { return seedPlayerSnapshot(props); },
        updateFromSnapshot(snapshot) { }
    };

    return player;
};
