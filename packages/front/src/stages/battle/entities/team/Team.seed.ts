import { TeamSnapshot } from '@timeflies/shared';
import { BattleDataPeriod } from '../../../../BattleData';
import { seedPlayer, SeedPlayerProps, seedPlayerSnapshot } from '../player/Player.seed';
import { SeedPeriodicProps } from '../PeriodicEntity';
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
        name: name ?? id,
        color: color ?? 'red',
        playersSnapshots: seedPlayers.map(seedPlayerSnapshot)
    };
};

export const seedTeam = <P extends BattleDataPeriod>(type: 'real' | 'fake', props: SeedTeamProps & SeedPeriodicProps<P>): Team<P> => {

    const { period, id, name, color, seedPlayers } = props;

    if (type === 'real') {
        return Team(period, seedTeamSnapshot(props));
    }

    const team: Team<P> = {
        period,
        id,
        name: name ?? 'T-' + id,
        color: color ?? 'red',
        get players() {
            return players;
        },
        getSnapshot() { return seedTeamSnapshot(props); },
        updateFromSnapshot(snapshot) { }
    };

    const players = seedPlayers.map(p => seedPlayer('fake', {
        ...p,
        period,
        team
    }));

    return team;
};
