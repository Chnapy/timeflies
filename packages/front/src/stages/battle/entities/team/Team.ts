import { TeamSnapshot } from '@timeflies/shared';
import { Player } from '../player/Player';
import { PeriodicEntity } from '../PeriodicEntity';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { BattleDataPeriod } from '../../../../BattleData';

export interface Team<P extends BattleDataPeriod> extends PeriodicEntity<P, TeamSnapshot> {
    readonly id: string;
    readonly letter: string;
    readonly players: Player<P>[];
}

export const Team = <P extends BattleDataPeriod>(
    period: P,
    { id, letter, playersSnapshots }: TeamSnapshot
): Team<P> => {

    const this_: Team<P> = {
        period,
        id,
        letter,
        get players() {
            return players;
        },

        getSnapshot(): TeamSnapshot {
            return {
                id: this_.id,
                letter: this_.letter,
                playersSnapshots: this_.players.map(p => p.getSnapshot())
            };
        },

        updateFromSnapshot(snapshot: TeamSnapshot): void {

            assertEntitySnapshotConsistency(this_.players, snapshot.playersSnapshots);

            snapshot.playersSnapshots.forEach(pSnap => {
                this_.players.find(p => p.id === pSnap.id)!.updateFromSnapshot(pSnap);
            });
        }
    };

    const players = playersSnapshots.map(snap => Player(period, snap, this_));

    return this_;
};
