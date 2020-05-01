import { assertIsDefined, assertIsNonNullable, equals, RoomClientAction, RoomServerAction } from '@timeflies/shared';
import { RoomListener } from './room';

export const getRoomCharacterRemove: RoomListener<RoomClientAction.CharacterRemove> = ({
    playerData: { id }, stateManager, sendToEveryone
}) => ({ position }) => {
    const { mapSelected } = stateManager.get();

    assertIsNonNullable(mapSelected);

    const { placementTiles } = mapSelected;

    const targetedTile = placementTiles.find(t => equals(t.position)(position));

    assertIsDefined(targetedTile);

    const mutable = stateManager.clone('playerList', 'teamList');

    const player = mutable.playerList.find(p => p.id === id);
    assertIsDefined(player);

    if (player.isReady) {
        throw new Error();
    }

    const indexToRemove = player.characters.findIndex(c => equals(c.position)(position));

    if (indexToRemove === -1) {
        throw new Error();
    }

    const [ deletedCharacter ] = player.characters.splice(indexToRemove, 1);

    if (!player.characters.length) {

        const team = mutable.teamList.find(t => t.playersIds.includes(id));
        assertIsDefined(team);

        team.playersIds = team.playersIds.filter(pid => pid !== id);
    }

    stateManager.set(mutable);

    sendToEveryone<RoomServerAction.CharacterSet>({
        type: 'room/character/set',
        action: 'remove',
        playerId: id,
        characterId: deletedCharacter.id,
        teams: mutable.teamList
    });
};
