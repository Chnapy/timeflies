import { Position, TeamSnapshot } from "@timeflies/shared";
import { Team } from "../../../Team";
import { BCharacter } from "./BCharacter";
import { BPlayer } from "./BPlayer";

export class BTeam implements Omit<Team, 'players'> {

    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: BPlayer[];
    readonly characters: BCharacter[];

    constructor(team: Team) {
        this.id = team.id;
        this.name = team.name;
        this.color = team.color;
        this.players = team.players.map(p => new BPlayer(p, this));
        this.characters = this.players.flatMap(p => p.characters);
    }

    placeCharacters(_positions: readonly Position[]): void {
        const positions = [ ..._positions ]
            .sort((a, b) => Math.random() < 0.5 ? -1 : 1);
            
        this.characters.forEach((c, i) => {
            if (!positions[ i ]) {
                throw new Error('no more position for index ' + i);
            }
            c.position = positions[ i ];
        });
    }

    toSnapshot(): TeamSnapshot {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            playersSnapshots: this.players.map(p => p.toSnapshot())
        };
    }
}
