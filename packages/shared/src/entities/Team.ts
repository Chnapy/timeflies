import { PlayerSnapshot } from "./Player";

export interface TeamSnapshot {
    id: string;
    name: string;
    color: string;
    playersSnapshots: PlayerSnapshot[];
}

export interface TeamRoom {
    id: string;
    letter: string;
    playersIds: string[];
}
