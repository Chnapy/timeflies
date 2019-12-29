import { Player, PlayerSnapshot } from './Player';
import { BattleScene } from '../scenes/BattleScene';
import { WithSnapshot } from './WithSnapshot';

export interface TeamSnapshot {
    id: number;
    name: string;
    color: number;
    playersSnapshots: PlayerSnapshot[];
}

export class Team implements WithSnapshot<TeamSnapshot> {

    readonly id: number;
    readonly name: string;
    readonly color: number;
    readonly players: Player[];

    constructor({ id, name, color, playersSnapshots }: TeamSnapshot, scene: BattleScene) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.players = playersSnapshots.map(snap => new Player(snap, this, scene));
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
