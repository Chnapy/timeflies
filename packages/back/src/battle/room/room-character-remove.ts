import { assertIsDefined, assertIsNonNullable, equals, RoomClientAction, RoomServerAction } from '@timeflies/shared';
import { RoomListener } from './room';

export const getRoomCharacterRemove: RoomListener<RoomClientAction.CharacterRemove> = ({
    playerData: { id }, stateManager, sendToEveryone, forbiddenError
}) => ({ position }) => {
    const { mapSelected } = stateManager.get();

    assertIsNonNullable(mapSelected,
        forbiddenError('cannot remove character if no map selected')
    );

    const { placementTileList } = mapSelected;

    const targetedTile = placementTileList.find(t => equals(t.position)(position));

    assertIsDefined(targetedTile,
        forbiddenError('cannot remove character on unknown position')
    );

    const mutable = stateManager.clone('playerList', 'teamList');

    const player = mutable.playerList.find(p => p.id === id);
    assertIsDefined(player);

    if (player.isReady) {
        throw forbiddenError('cannot remove character if player is ready');
    }

    const indexToRemove = player.characters.findIndex(c => equals(c.position)(position));

    if (indexToRemove === -1) {
        throw forbiddenError('cannot remove character on position not occupied by player characters');
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
        teamList: mutable.teamList
    });
};
