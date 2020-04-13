import { TeamSnapshot } from "../entities/Team";
import objectHash from 'object-hash';

export interface BattleSnapshot {
    time: number;
    battleHash: string;
    launchTime: number;
    teamsSnapshots: TeamSnapshot[];
}

export const getBattleSnapshotWithHash = ({
    teamsSnapshots,
    ...rest
}: Omit<BattleSnapshot, 'battleHash'>): BattleSnapshot => {

    const battleHash = objectHash(
        // TODO workaround for https://github.com/puleos/object-hash/issues/62
        JSON.parse(JSON.stringify(
            teamsSnapshots
        )), {
        respectType: false
    });

    return {
        teamsSnapshots,
        ...rest,
        battleHash
    };
}
