import { PlayerSnapshot, PlayerState, assertThenGet, assertIsDefined } from '@timeflies/shared';
import { serviceCurrentPlayer } from '../../../services/serviceCurrentPlayer';
import { Character } from './Character';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';

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
        assertIsDefined
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
            snapshot.charactersSnapshots.forEach(cSnap => {
                const character = assertThenGet(
                    characters.find(c => c.id === cSnap.staticData.id),
                    assertIsDefined
                );

                character.updateFromSnapshot(cSnap);
            });
        }
    };

    const characters = charactersSnapshots.map(snap => characterCreator(snap, this_));

    return this_;
};
