import { TeamSnapshot } from '@timeflies/shared';
import { Player } from '../player/Player';
import { PeriodicEntity } from '../PeriodicEntity';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { BattleDataPeriod } from '../../../../BattleData';

export interface Team<P extends BattleDataPeriod> extends PeriodicEntity<P, TeamSnapshot> {
    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: Player<P>[];
}

export const Team = <P extends BattleDataPeriod>(
    period: P,
    { id, name, color, playersSnapshots }: TeamSnapshot
): Team<P> => {

    const this_: Team<P> = {
        period,
        id,
        name,
        color,
        get players() {
            return players;
        },

        getSnapshot(): TeamSnapshot {
            return {
                id: this.id,
                name: this.name,
                color: this.color,
                playersSnapshots: this.players.map(p => p.getSnapshot())
            };
        },

        updateFromSnapshot(snapshot: TeamSnapshot): void {

            assertEntitySnapshotConsistency(this.players, snapshot.playersSnapshots);

            snapshot.playersSnapshots.forEach(pSnap => {
                this.players.find(p => p.id === pSnap.id)!.updateFromSnapshot(pSnap);
            });
        }
    };

    const players = playersSnapshots.map(snap => Player(period, snap, this_));

    return this_;
};
