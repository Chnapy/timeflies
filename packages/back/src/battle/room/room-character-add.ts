import { RoomListener } from './room';
import { RoomClientAction, equals, assertIsDefined, CharacterRoom, RoomServerAction, assertIsNonNullable } from '@timeflies/shared';
import { Util } from '../../Util';

export const getRoomCharacterAdd: RoomListener<RoomClientAction.CharacterAdd> = ({
    playerData: { id }, stateManager, sendToEveryone, forbiddenError
}) => ({ characterType, position }) => {

    const { mapSelected, teamList, playerList } = stateManager.get();

    // Check map

    assertIsNonNullable(mapSelected,
        forbiddenError('cannot add character if no map selected')
    );

    // Check occupied positions

    const characterList = playerList.flatMap(p => p.characters);

    if (characterList.some(c => equals(c.position)(position))) {
        throw forbiddenError('cannot add character on occupied position');
    }

    const mutable = stateManager.clone('teamList', 'playerList');

    // Manage teams

    const currentTeam = teamList.find(t => t.playersIds.includes(id));

    const targetedTeamId = mapSelected.placementTileList
        .find(p => equals(p.position)(position))
        ?.teamId;
    assertIsDefined(targetedTeamId);

    if (!currentTeam) {

        const team = mutable.teamList.find(t => t.id === targetedTeamId);
        assertIsDefined(team);

        team.playersIds.push(id);

    } else if (currentTeam.id !== targetedTeamId) {
        throw forbiddenError('cannot add character on other team position');
    }

    const player = mutable.playerList.find(p => p.id === id);
    assertIsDefined(player);

    // Check player state

    if (player.isReady) {
        throw forbiddenError('cannot add character if player is ready');
    }

    // Add character to player

    const character: CharacterRoom = {
        id: Util.getUnique(),
        type: characterType,
        position
    };

    player.characters.push(character);

    stateManager.set(mutable);

    sendToEveryone<RoomServerAction.CharacterSet>({
        type: 'room/character/set',
        action: 'add',
        playerId: id,
        character,
        teamList: mutable.teamList
    });
}
