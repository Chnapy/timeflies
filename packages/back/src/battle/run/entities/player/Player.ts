import { PlayerRoom, PlayerSnapshot } from '@timeflies/shared';
import { WSSocketPool } from "../../../../transport/ws/WSSocket";

export type Player = {
    id: string;
    name: string;
    socket: WSSocketPool;
    teamId: string;
};

export const playerToSnapshot = ({ id, name, teamId }: Player): PlayerSnapshot => ({
    id,
    name,
    teamId
});

export const Player = (
    { id, name }: Pick<PlayerRoom, 'id' | 'name'>,
    teamId: string,
    socket: WSSocketPool
): Player => {

    return {
        id,
        name,
        socket,
        teamId
    };

    // const this_: Player = {
    //     id: playerData.id,
    //     name: playerData.name,
    //     socket: playerData.socket,
    //     teamId,
    //     get characters() {
    //         return characters;
    //     },
    //     toSnapshot(): PlayerSnapshot {
    //         return {
    //             id: this.id,
    //             name: this.name,
    //             charactersSnapshots: this.characters.map(c => c.toSnapshot())
    //         };
    //     },
    //     updateFromSnapshot(snapshot) {

    //         characters.forEach(character => character.updateFromSnapshot(
    //             snapshot.charactersSnapshots.find(snap => snap.id === character.id)!
    //         ));
    //     }
    // };

    // const characters = playerData.staticCharacters.map(({ staticData, initialPosition }) =>
    //     characterCreator(staticData, initialPosition, this_)
    // );

    // return this_;
};
