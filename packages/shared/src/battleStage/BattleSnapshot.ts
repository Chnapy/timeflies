import { TeamSnapshot } from "../entities/Team";
import objectHash from 'object-hash';

export interface BattleSnapshot {
    time: number;
    battleHash: string;
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}

// TODO do not include 'time'
export const getBattleSnapshotWithHash = (o: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {
    const battleHash = objectHash(o);
    return {
        ...o,
        battleHash
    };
}
