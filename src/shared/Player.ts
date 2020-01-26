import { WSSocket } from "../transport/ws/WSSocket";
import { CharacterSnapshot, StaticCharacter } from "./Character";

export type PlayerState = 'init' | 'battle-prepare' | 'battle-loading' | 'battle-ready' | 'battle-run';

export interface Player {
    id: string;
    name: string;
    state: PlayerState;
    socket: WSSocket;
    staticCharacters: StaticCharacter[];
}

export interface PlayerSnapshot {

    id: string;

    name: string;
    
    state: PlayerState;

    charactersSnapshots: CharacterSnapshot[];
}
