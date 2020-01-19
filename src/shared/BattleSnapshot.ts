import { TeamSnapshot } from "./Team";
import { BCharacter } from './Character';

export interface BGlobalTurnState {
    startTime: number;
    charactersOrdered: BCharacter[];
    currentTurn: BTurnState;
}

export interface BTurnState {
    startTime: number;
    character: BCharacter;
    estimatedDuration: number;
}

export interface GlobalTurnState {
    startTime: number;
    order: string[];
}

export interface TurnState {
    startTime: number;
    characterId: string;
}

export interface BattleSnapshot {
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}
