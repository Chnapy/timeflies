import { RequiredOnly } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Player } from './Player';

export type SeedPlayerProps<P extends BattleDataPeriod> = RequiredOnly<Player<P>, 'id' | 'period'>;

export const seedPlayer = <P extends BattleDataPeriod>(props: SeedPlayerProps<P>): Player<P> => {
    return {
        teamId: '',
        name: 'name',
        ...props
    };
};
