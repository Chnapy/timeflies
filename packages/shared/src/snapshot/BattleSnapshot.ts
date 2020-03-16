import { TeamSnapshot } from "./TeamSnapshot";
import objectHash from 'object-hash';

export interface BattleSnapshot {
    hash: string;
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}

export const generateObjectHash = (o: object): string => {
    return objectHash(o);
}
