import { TeamSnapshot } from "./TeamSnapshot";

export interface BattleSnapshot {
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}
