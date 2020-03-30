import { assertIsNonNullable, assertThenGet, PlayerSnapshot, PlayerState } from '@timeflies/shared';
import { serviceCurrentPlayer } from '../../../../services/serviceCurrentPlayer';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { Character } from '../character/Character';
import { Team } from "../team/Team";
import { WithSnapshot } from '../WithSnapshot';

export interface Player extends WithSnapshot<PlayerSnapshot> {
    readonly id: string;
    readonly itsMe: boolean;
    readonly name: string;
    readonly state: PlayerState;
    readonly team: Team;
    readonly characters: Character[];
}

interface Dependencies {
    characterCreator: typeof Character;
}

export const Player = (
    {
        id,
        name,
        state,
        charactersSnapshots
    }: PlayerSnapshot,
    team: Team,
    { characterCreator }: Dependencies = { characterCreator: Character }
): Player => {
    const itsMe = id === assertThenGet(
        serviceCurrentPlayer(),
        assertIsNonNullable
    ).id;

    const this_: Player = {
        id,
        name,
        itsMe,
        get state() {
            return state;
        },
        team,
        get characters() {
            return characters;
        },

        getSnapshot(): PlayerSnapshot {
            return {
                id,
                name,
                state,
                charactersSnapshots: characters.map(c => c.getSnapshot())
            };
        },

        updateFromSnapshot(snapshot: PlayerSnapshot): void {
            state = snapshot.state;

            assertEntitySnapshotConsistency(characters, snapshot.charactersSnapshots);

            snapshot.charactersSnapshots.forEach(cSnap => {
                characters.find(c => c.id === cSnap.id)!.updateFromSnapshot(cSnap);
            });
        }
    };

    const characters = charactersSnapshots.map(snap => characterCreator(snap, this_));

    return this_;
};
