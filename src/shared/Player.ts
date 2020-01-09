import { WSSocket } from "../transport/ws/WSSocket";
import { BCharacter, CharacterSnapshot, StaticCharacter } from "./Character";
import { BTeam } from "./Team";

export type PlayerState = 'init' | 'battle-prepare' | 'battle-loading' | 'battle-ready' | 'battle-run';

export interface Player {
    id: string;
    name: string;
    state: PlayerState;
    socket: WSSocket;
    staticCharacters: StaticCharacter[];
}

export class BPlayer implements Omit<Player, 'staticCharacters'> {

    readonly id: string;
    readonly name: string;
    readonly state: PlayerState;
    readonly socket: WSSocket;

    readonly team: BTeam;
    readonly characters: BCharacter[];

    constructor(player: Player, team: BTeam) {
        this.id = player.id;
        this.name = player.name;
        this.state = player.state;
        this.socket = player.socket;

        this.team = team;
        this.characters = player.staticCharacters.map(sc => new BCharacter(sc, this));
    }
}

export interface PlayerSnapshot {

    id: string;

    name: string;

    charactersSnapshots: CharacterSnapshot[];
}
