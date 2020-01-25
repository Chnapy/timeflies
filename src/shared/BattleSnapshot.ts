import { TeamSnapshot } from "./Team";

export interface BattleSnapshot {
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}
