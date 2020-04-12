import { PlayerSnapshot } from "@timeflies/shared";
import { Player } from "../../../Player";
import { WSSocket } from "../../../transport/ws/WSSocket";
import { BCharacter } from "./BCharacter";
import { BTeam } from "./BTeam";

export class BPlayer implements Omit<Player, 'staticCharacters' | 'state'> {

    readonly id: string;
    readonly name: string;

    // readonly state: PlayerState;
    readonly socket: WSSocket;

    readonly team: BTeam;
    readonly characters: BCharacter[];

    constructor(player: Player, team: BTeam) {
        this.id = player.id;
        this.name = player.name;
        // this.state = player.state;
        this.socket = player.socket;
        this.team = team;
        this.characters = player.staticCharacters.map(sc => new BCharacter(sc, this));
    }
    
    toSnapshot(): PlayerSnapshot {
        return {
            id: this.id,
            name: this.name,
            // state: this.state,
            charactersSnapshots: this.characters.map(c => c.toSnapshot())
        };
    }
}
