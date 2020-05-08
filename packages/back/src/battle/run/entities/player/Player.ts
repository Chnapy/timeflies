import { PlayerSnapshot } from "@timeflies/shared";
import { PlayerData } from "../../../../PlayerData";
import { WSSocketPool } from "../../../../transport/ws/WSSocket";
import { Character } from "../character/Character";
import { Entity } from '../Entity';
import { Team } from "../team/Team";

export interface Player extends Entity<PlayerSnapshot> {
    readonly name: string;
    readonly socket: WSSocketPool;
    readonly team: Team;
    readonly characters: Character[];
}

interface Dependencies {
    characterCreator: typeof Character;
}

export const Player = (
    playerData: PlayerData, team: Team,
    { characterCreator }: Dependencies = { characterCreator: Character }
): Player => {

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
        },
        updateFromSnapshot(snapshot) {

            characters.forEach(character => character.updateFromSnapshot(
                snapshot.charactersSnapshots.find(snap => snap.id === character.id)!
            ));
        }
    };

    const characters = playerData.staticCharacters.map(({ staticData, initialPosition }) =>
        characterCreator(staticData, initialPosition, this_)
    );

    return this_;
};
