import { RequiredOnly, PlayerSnapshot } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { Player } from './Player';

export type SeedPlayerProps<P extends BattleDataPeriod> = RequiredOnly<Player<P>, 'id' | 'period'>;

export type SeedPlayerSnapshotProps = RequiredOnly<PlayerSnapshot, 'id'>;

export const seedPlayerSnapshot = (props: SeedPlayerSnapshotProps): PlayerSnapshot => {
    return {
        teamId: '',
        name: 'name',
        ...props
    };
};

export const seedPlayer = <P extends BattleDataPeriod>(props: SeedPlayerProps<P>): Player<P> => {
    return {
        teamId: '',
        name: 'name',
        ...props
    };
};
