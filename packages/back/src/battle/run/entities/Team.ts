import { Position, TeamSnapshot } from "@timeflies/shared";
import { TeamData } from "../../../Team";
import { Character } from "./Character";
import { Player } from "./Player";

export interface Team {
    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly players: Player[];
    readonly characters: Character[];
    placeCharacters(positions: readonly Position[]): void;
    toSnapshot(): TeamSnapshot;
}

export const Team = (teamData: TeamData) => {

    const this_: Team = {
        id: teamData.id,
        name: teamData.name,
        color: teamData.color,
        get players() {
            return players;
        },
        get characters() {
            return characters;
        },
        placeCharacters(_positions) {
            const positions = [ ..._positions ]
                .sort((a, b) => Math.random() < 0.5 ? -1 : 1);

            characters.forEach((c, i) => {
                if (!positions[ i ]) {
                    throw new Error('no more position for index ' + i);
                }
                c.position = positions[ i ];
            });
        },
        toSnapshot(): TeamSnapshot {
            return {
                id: this_.id,
                name: this_.name,
                color: this_.color,
                playersSnapshots: players.map(p => p.toSnapshot())
            };
        }
    };

    const players = teamData.players.map(p => Player(p, this_));
    const characters = players.flatMap(p => p.characters);

    return this_;
};
