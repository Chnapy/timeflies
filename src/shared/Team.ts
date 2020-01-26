import { Player, PlayerSnapshot } from "./Player";
import { OmitFn } from "../types/global";

export interface Team {
    id: string;
    name: string;
    color: string;

    players: Player[];
}

export interface TeamSnapshot extends OmitFn<Team, 'players'> {
    playersSnapshots: PlayerSnapshot[];
}
