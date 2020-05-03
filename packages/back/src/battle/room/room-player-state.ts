import { assertIsDefined, RoomClientAction, RoomServerAction } from '@timeflies/shared';
import { RoomListener } from './room';

export const getRoomPlayerState: RoomListener<RoomClientAction.PlayerState> = ({
    playerData: { id }, stateManager, sendToEveryone
}) => ({ isLoading, isReady }) => {

    const { mapSelected, teamList } = stateManager.get();

    if (!mapSelected && (isLoading || isReady)) {
        throw new Error();
    }

    if (isReady) {

        const teamListWithPlayers = teamList.filter(t => t.playersIds.length);

        if (teamListWithPlayers.length < 2) {
            throw new Error();
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
