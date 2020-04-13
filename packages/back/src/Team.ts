import { PlayerData } from "./Player";

export interface TeamData {
    id: string;
    name: string;
    color: string;

    players: PlayerData[];
}
