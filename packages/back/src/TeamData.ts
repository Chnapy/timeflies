import { PlayerData } from "./PlayerData";

export interface TeamData {
    id: string;
    name: string;
    color: string;

    players: PlayerData[];
}
