import { RequiredOnly, TeamSnapshot } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Team } from './Team';

export type SeedTeamProps<P extends BattleDataPeriod> = RequiredOnly<Team<P>, 'id' | 'period'>

export type SeedTeamSnapshotProps = RequiredOnly<TeamSnapshot, 'id'>;

export const seedTeamSnapshot = (props: SeedTeamSnapshotProps): TeamSnapshot => ({
    letter: 'A',
    ...props
});

export const seedTeam = <P extends BattleDataPeriod>(props: SeedTeamProps<P>): Team<P> => {

    return {
        letter: 'A',
        ...props
    };
};
