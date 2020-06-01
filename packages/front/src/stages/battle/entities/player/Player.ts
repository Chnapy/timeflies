import { PlayerSnapshot } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Player<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    name: string;
    teamId: string;
};

export const playerToSnapshot = ({ id, name, teamId }: Player<BattleDataPeriod>): PlayerSnapshot => {
    return {
        id,
        name,
        teamId
    };
};

// TODO
// export const playerIsMine = 

export const Player = <P extends BattleDataPeriod>(
    period: P,
    {
        id,
        teamId,
        name
    }: PlayerSnapshot
): Player<P> => {

    return {
        id,
        period,
        name,
        teamId
    };

    // const this_: Player<P> = {
    //     period,
    //     id,
    //     name,
    //     itsMe,
    //     team,
    //     get characters() {
    //         return characters;
    //     },

    //     getSnapshot(): PlayerSnapshot {
    //         return {
    //             id,
    //             name,
    //             charactersSnapshots: characters.map(c => c.getSnapshot())
    //         };
    //     },

    //     updateFromSnapshot(snapshot: PlayerSnapshot): void {

    //         // assertEntitySnapshotConsistency(characters, snapshot.charactersSnapshots);

    //         snapshot.charactersSnapshots.forEach(cSnap => {
    //             characters.find(c => c.id === cSnap.id)!.updateFromSnapshot(cSnap);
    //         });
    //     }
    // };

    // const characters = charactersSnapshots.map(snap => characterCreator(period, snap, this_));

    // return this_;
};
