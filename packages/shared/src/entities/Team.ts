import { PlayerSnapshot } from "./Player";

export interface TeamSnapshot {
    id: string;
    name: string;
    color: string;
    playersSnapshots: PlayerSnapshot[];
}
