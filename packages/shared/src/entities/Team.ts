import { PlayerSnapshot, PlayerRoom } from "./Player";

export interface TeamSnapshot {
    id: string;
    name: string;
    color: string;
    playersSnapshots: PlayerSnapshot[];
}

export interface TeamRoom {
    id: string;
    letter: string;
    players: PlayerRoom[];
}
