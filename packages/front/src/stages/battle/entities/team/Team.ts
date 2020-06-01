import { TeamSnapshot } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Team<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    letter: string;
};

export const teamToSnapshot = ({ id, letter }: Team<BattleDataPeriod>): TeamSnapshot => {
    return {
        id,
        letter
    };
};

export const Team = <P extends BattleDataPeriod>(
    period: P,
    { id, letter }: TeamSnapshot
): Team<P> => {

    return {
        id,
        period,
        letter
    };

    // const this_: Team<P> = {
    //     period,
    //     id,
    //     letter,
    //     get players() {
    //         return players;
    //     },

    //     getSnapshot(): TeamSnapshot {
    //         return {
    //             id: this_.id,
    //             letter: this_.letter,
    //             playersSnapshots: this_.players.map(p => p.getSnapshot())
    //         };
    //     },

    //     updateFromSnapshot(snapshot: TeamSnapshot): void {

    //         // assertEntitySnapshotConsistency(this_.players, snapshot.playersSnapshots);

    //         snapshot.playersSnapshots.forEach(pSnap => {
    //             this_.players.find(p => p.id === pSnap.id)!.updateFromSnapshot(pSnap);
    //         });
    //     }
    // };

    // const players = playersSnapshots.map(snap => Player(period, snap, this_));

    // return this_;
};
