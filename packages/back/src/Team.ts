import { Player } from "./Player";

export interface Team {
    id: string;
    name: string;
    color: string;

    players: Player[];
}
