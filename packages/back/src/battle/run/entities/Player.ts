import { PlayerSnapshot } from "@timeflies/shared";
import { PlayerData } from "../../../PlayerData";
import { WSSocket } from "../../../transport/ws/WSSocket";
import { Team } from "./Team";
import { Character } from "./Character";

export interface Player {
    readonly id: string;
    readonly name: string;
    readonly socket: WSSocket;
    readonly team: Team;
    readonly characters: Character[];
    toSnapshot(): PlayerSnapshot;
}

export const Player = (playerData: PlayerData, team: Team): Player => {

    const this_: Player = {
        id: playerData.id,
        name: playerData.name,
        socket: playerData.socket,
        team,
        get characters() {
            return characters;
        },
        toSnapshot(): PlayerSnapshot {
            return {
                id: this.id,
                name: this.name,
                charactersSnapshots: this.characters.map(c => c.toSnapshot())
            };
        }
    };

    const characters = playerData.staticCharacters.map(sc => Character(sc, this_));

    return this_;
};
