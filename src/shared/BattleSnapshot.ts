import { TeamSnapshot } from "./Team";

export interface GlobalTurnState {
    startTime: number;
    order: string[];
}

export interface BattleSnapshot {
    launchTime: number;
    globalTurnState: GlobalTurnState;
    teamsSnapshots: TeamSnapshot[];
}
