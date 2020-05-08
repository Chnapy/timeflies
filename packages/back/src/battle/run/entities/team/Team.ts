import { TeamSnapshot } from "@timeflies/shared";
import { TeamData } from "../../../../TeamData";
import { Character } from "../character/Character";
import { Entity } from '../Entity';
import { Player } from "../player/Player";

export interface Team extends Entity<TeamSnapshot> {
    readonly name: string;
    readonly color: string;
    readonly players: Player[];
    readonly characters: Character[];
    clone(): Team;
}

interface Dependencies {
    playerCreator: typeof Player;
}

export const Team = (teamData: TeamData, deps: Dependencies = { playerCreator: Player }) => {
    const { playerCreator } = deps;

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
        toSnapshot(): TeamSnapshot {
            return {
                id: this_.id,
                name: this_.name,
                color: this_.color,
                playersSnapshots: players.map(p => p.toSnapshot())
            };
        },
        updateFromSnapshot(snapshot) {
            players.forEach(player => player.updateFromSnapshot(
                snapshot.playersSnapshots.find(snap => snap.id === player.id)!
            ));
        },
        clone() {
            const team = Team(teamData, deps);
            team.updateFromSnapshot(this_.toSnapshot());
            return team;
        }
    };

    const players = teamData.players.map(p => playerCreator(p, this_));
    const characters = players.flatMap(p => p.characters);

    return this_;
};
