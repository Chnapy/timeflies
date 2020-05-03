import { CharacterRoom, CharacterSnapshot } from "./Character";

export interface PlayerInfos {
    id: string;
    name: string;
}

export interface PlayerSnapshot {
    id: string;
    name: string;
    charactersSnapshots: CharacterSnapshot[];
}

export interface PlayerRoom {
    id: string;
    name: string;
    isAdmin: boolean;
    isReady: boolean;
    isLoading: boolean;
    characters: CharacterRoom[];
}
