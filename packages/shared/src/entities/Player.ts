import { CharacterSnapshot } from "./Character";

export interface PlayerInfos {
    id: string;
    name: string;
}

export interface PlayerSnapshot {
    id: string;
    name: string;
    charactersSnapshots: CharacterSnapshot[];
}
