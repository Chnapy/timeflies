import { BPlayer, Player, PlayerSnapshot } from "./Player";

export interface Team {
    id: string;
    name: string;
    color: string;

    players: Player[];
}

export class BTeam implements Omit<Team, 'players'> {
    
    readonly id: string;
    readonly name: string;
    readonly color: string;

    readonly players: BPlayer[];

    constructor(team: Team) {
        this.id = team.id;
        this.name = team.name;
        this.color = team.color;

        this.players = team.players.map(p => new BPlayer(p, this))
    }
}

export interface TeamSnapshot extends Omit<Team, 'players'> {
    playersSnapshots: PlayerSnapshot[];
}
