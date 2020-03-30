import { TeamSnapshot } from '@timeflies/shared';
import { Player } from '../player/Player';
import { WithSnapshot } from '../WithSnapshot';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';

export interface Team extends WithSnapshot<TeamSnapshot> {
    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: Player[];
}

export const Team = ({ id, name, color, playersSnapshots }: TeamSnapshot): Team => {

    const this_: Team = {
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

    const players = playersSnapshots.map(snap => Player(snap, this_));

    return this_;
};
