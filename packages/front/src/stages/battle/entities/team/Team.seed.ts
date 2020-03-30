import { TeamSnapshot } from '@timeflies/shared';
import { SeedPlayerProps, seedPlayerSnapshot, seedPlayer } from '../player/Player.seed';
import { Team } from './Team';

export interface SeedTeamProps {
    id: string;
    name?: string;
    color?: string;
    seedPlayers: SeedPlayerProps[];
}

export const seedTeamSnapshot = ({ id, name, color, seedPlayers }: SeedTeamProps): TeamSnapshot => {

    return {
        id,
        name: name ?? 'T-' + id,
        color: color ?? 'red',
        playersSnapshots: seedPlayers.map(seedPlayerSnapshot)
    };
};

export const seedTeam = (type: 'real' | 'fake', props: SeedTeamProps): Team => {

    if (type === 'real') {
        return Team(seedTeamSnapshot(props));
    }
    const { id, name, color, seedPlayers } = props;

    const team = {
        id,
        name: name ?? 'T-' + id,
        color: color ?? 'red',
        players: seedPlayers.map(p => seedPlayer('fake', {
            ...p,
            team
        })),
        getSnapshot() { return seedTeamSnapshot(props); },
        updateFromSnapshot(snapshot) { }
    };
    return team;
};
