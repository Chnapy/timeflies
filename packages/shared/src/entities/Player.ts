import { CharacterRoom } from "./Character";

export interface PlayerInfos {
    id: string;
    name: string;
}

export type PlayerSnapshot = {
    id: string;
    teamId: string;
    name: string;
};

export interface PlayerRoom {
    id: string;
    name: string;
    isAdmin: boolean;
    isReady: boolean;
    isLoading: boolean;
    characters: CharacterRoom[];
}
