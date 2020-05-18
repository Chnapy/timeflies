import { PlayerData } from "./PlayerData";

export interface TeamData {
    id: string;
    letter: string;
    players: PlayerData[];
}
