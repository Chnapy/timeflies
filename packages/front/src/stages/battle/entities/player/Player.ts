import { assertIsNonNullable, assertThenGet, PlayerSnapshot } from '@timeflies/shared';
import { serviceCurrentPlayer } from '../../../../services/serviceCurrentPlayer';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { Character } from '../character/Character';
import { Team } from "../team/Team";
import { WithSnapshot } from '../WithSnapshot';

export interface Player extends WithSnapshot<PlayerSnapshot> {
    readonly id: string;
    readonly itsMe: boolean;
    readonly name: string;
    readonly team: Team;
    readonly characters: Character[];
}

export interface PlayerDependencies {
    characterCreator: typeof Character;
}

export const Player = (
    {
        id,
        name,
        charactersSnapshots
    }: PlayerSnapshot,
    team: Team,
    { characterCreator }: PlayerDependencies = { characterCreator: Character }
): Player => {
    const itsMe = id === assertThenGet(
        serviceCurrentPlayer(),
        assertIsNonNullable
    ).id;

    const this_: Player = {
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

    const characters = charactersSnapshots.map(snap => characterCreator(snap, this_));

    return this_;
};
