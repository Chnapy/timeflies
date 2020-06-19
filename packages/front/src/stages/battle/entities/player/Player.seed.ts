import { PlayerSnapshot, RequiredOnly } from '@timeflies/shared';
import { Player } from './Player';

export type SeedPlayerProps = RequiredOnly<Player, 'id'>;

export type SeedPlayerSnapshotProps = RequiredOnly<PlayerSnapshot, 'id'>;

export const seedPlayerSnapshot = (props: SeedPlayerSnapshotProps): PlayerSnapshot => {
    return {
        teamId: '',
        name: 'name',
        ...props
    };
};

export const seedPlayer = (props: SeedPlayerProps): Player => {
    return {
        teamId: '',
        name: 'name',
        ...props
    };
};
