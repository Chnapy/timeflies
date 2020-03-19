import { TeamSnapshot } from '@timeflies/shared';
import { Player } from './Player';
import { WithSnapshot } from './WithSnapshot';
import { assertEntitySnapshotConsistency } from '../snapshot/SnapshotManager';

export class Team implements WithSnapshot<TeamSnapshot> {

    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: Player[];

    constructor({ id, name, color, playersSnapshots }: TeamSnapshot) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.players = playersSnapshots.map(snap => Player(snap, this));
    }

    getSnapshot(): TeamSnapshot {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            playersSnapshots: this.players.map(p => p.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: TeamSnapshot): void {

        assertEntitySnapshotConsistency(this.players, snapshot.playersSnapshots);

        snapshot.playersSnapshots.forEach(pSnap => {
            this.players.find(p => p.id === pSnap.id)!.updateFromSnapshot(pSnap);
        });
    }
}
