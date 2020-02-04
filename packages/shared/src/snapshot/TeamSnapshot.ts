import { PlayerSnapshot } from "./PlayerSnapshot";

export interface TeamSnapshot {
    id: string;
    name: string;
    color: string;
    playersSnapshots: PlayerSnapshot[];
}
