import { TeamSnapshot } from "./TeamSnapshot";
import objectHash from 'object-hash';

export interface BattleSnapshot {
    time: number;
    battleHash: string;
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}

export const getBattleSnapshotWithHash = (o: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {
    const battleHash = objectHash(o);
    return {
        ...o,
        battleHash
    };
}
