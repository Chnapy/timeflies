import { CharacterSnapshot } from "./CharacterSnapshot";

export type PlayerState = 'init' | 'battle-prepare' | 'battle-loading' | 'battle-ready' | 'battle-run';

export interface PlayerInfos {
    id: string;
    name: string;
}

export interface PlayerSnapshot {
    id: string;
    name: string;
    state: PlayerState;
    charactersSnapshots: CharacterSnapshot[];
}
