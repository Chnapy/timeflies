import { RequiredOnly } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Team } from './Team';

export type SeedTeamProps<P extends BattleDataPeriod> = RequiredOnly<Team<P>, 'id' | 'period'>

export const seedTeam = <P extends BattleDataPeriod>(props: SeedTeamProps<P>): Team<P> => {

    return {
        letter: 'A',
        ...props
    };
};
