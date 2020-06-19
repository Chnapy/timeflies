import { RequiredOnly, TeamSnapshot } from '@timeflies/shared';
import { Team } from './Team';

export type SeedTeamProps = RequiredOnly<Team, 'id'>

export type SeedTeamSnapshotProps = RequiredOnly<TeamSnapshot, 'id'>;

export const seedTeamSnapshot = (props: SeedTeamSnapshotProps): TeamSnapshot => ({
    letter: 'A',
    ...props
});

export const seedTeam = (props: SeedTeamProps): Team => {

    return {
        letter: 'A',
        ...props
    };
};
