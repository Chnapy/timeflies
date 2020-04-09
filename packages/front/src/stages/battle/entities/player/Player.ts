import { assertIsNonNullable, assertThenGet, PlayerSnapshot } from '@timeflies/shared';
import { serviceCurrentPlayer } from '../../../../services/serviceCurrentPlayer';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { Character } from '../character/Character';
import { Team } from "../team/Team";
import { PeriodicEntity } from '../PeriodicEntity';
import { BattleDataPeriod } from '../../../../BattleData';

export interface Player<P extends BattleDataPeriod> extends PeriodicEntity<P, PlayerSnapshot> {
    readonly id: string;
    readonly itsMe: boolean;
    readonly name: string;
    readonly team: Team<P>;
    readonly characters: Character<P>[];
}

export interface PlayerDependencies {
    characterCreator: typeof Character;
}

export const Player = <P extends BattleDataPeriod>(
    period: P,
    {
        id,
        name,
        charactersSnapshots
    }: PlayerSnapshot,
    team: Team<P>,
    { characterCreator }: PlayerDependencies = { characterCreator: Character }
): Player<P> => {
    const itsMe = id === assertThenGet(
        serviceCurrentPlayer(),
        assertIsNonNullable
    ).id;

    const this_: Player<P> = {
        period,
        id,
        name,
        itsMe,
        team,
        get characters() {
            return characters;
        },

        getSnapshot(): PlayerSnapshot {
            return {
                id,
                name,
                charactersSnapshots: characters.map(c => c.getSnapshot())
            };
        },

        updateFromSnapshot(snapshot: PlayerSnapshot): void {

            assertEntitySnapshotConsistency(characters, snapshot.charactersSnapshots);

            snapshot.charactersSnapshots.forEach(cSnap => {
                characters.find(c => c.id === cSnap.id)!.updateFromSnapshot(cSnap);
            });
        }
    };

    const characters = charactersSnapshots.map(snap => characterCreator(period, snap, this_));

    return this_;
};
