import { TeamSnapshot } from '@timeflies/shared';
import { Player } from './Player';
import { WithSnapshot } from './WithSnapshot';

export class Team implements WithSnapshot<TeamSnapshot> {

    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: Player[];

    constructor({ id, name, color, playersSnapshots }: TeamSnapshot) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.players = playersSnapshots.map(snap => new Player(snap, this));
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
        snapshot.playersSnapshots.forEach(pSnap => {
            const player = this.players.find(p => p.id === pSnap.id);

            player!.updateFromSnapshot(pSnap);
        });
    }
}
