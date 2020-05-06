import { assertIsDefined, RoomClientAction, RoomServerAction } from '@timeflies/shared';
import { RoomListener } from './room';

export const getRoomPlayerState: RoomListener<RoomClientAction.PlayerState> = ({
    playerData: { id }, stateManager, sendToEveryone, forbiddenError
}) => ({ isLoading, isReady }) => {

    const { mapSelected, teamList } = stateManager.get();

    if (!mapSelected && (isLoading || isReady)) {
        throw forbiddenError('cannot set player state to loading nor ready if no map selected');
    }

    if (isReady) {

        const teamListWithPlayers = teamList.filter(t => t.playersIds.length);

        if (teamListWithPlayers.length < 2) {
            throw forbiddenError('cannot set player state to ready if no enough characters on map');
        }
    }

    const mutable = stateManager.clone('playerList');

    const player = mutable.playerList.find(p => p.id === id);
    assertIsDefined(player);

    player.isLoading = isLoading;
    player.isReady = isReady;

    stateManager.set(mutable);

    sendToEveryone<RoomServerAction.PlayerRefresh>({
        type: 'room/player/refresh',
        player: {
            id,
            isAdmin: player.isAdmin,
            isLoading,
            isReady
        }
    });
};
