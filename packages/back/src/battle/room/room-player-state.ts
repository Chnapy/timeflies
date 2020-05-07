import { assertIsDefined, RoomClientAction, RoomServerAction, assertIsNonNullable } from '@timeflies/shared';
import { RoomListener } from './room';
import { BattleRunRoom, RoomStateReady } from '../run/BattleRunRoom';

export const getRoomPlayerState: RoomListener<RoomClientAction.PlayerState> = ({
    playerData: { id }, stateManager, sendToEveryone, forbiddenError
}) => ({ isLoading, isReady }) => {

    const { step, mapSelected, teamList, launchTimeout } = stateManager.get();

    if(step === 'will-launch') {
        if(isReady || isLoading) {
            throw forbiddenError('cannot set player state to loading nor ready on will-launch step');
        }

        assertIsNonNullable(launchTimeout);

        clearTimeout(launchTimeout);

        stateManager.set({
            step: 'idle',
            launchTimeout: null
        });

        sendToEveryone<RoomServerAction.BattleLaunch>({
            type: 'room/battle-launch',
            action: 'cancel'
        });
    }

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

    const allPlayersAreReady = mutable.playerList.every(p => p.isReady);

    if(allPlayersAreReady) {

        // TODO use config
        const delay = 5000;

        const launchTime = Date.now() + delay;

        sendToEveryone<RoomServerAction.BattleLaunch>({
            type: 'room/battle-launch',
            action: 'launch',
            launchTime
        });

        const launchTimeout = setTimeout(() => {

            const roomState = stateManager.get();

            assertIsNonNullable(mapSelected);

            const roomStateReady: RoomStateReady = {
                ...roomState,
                mapSelected,
                playerDataList: roomState.playerDataList.map(p => {

                    const socket = p.socket.close();

                    return {
                        ...p,
                        socket
                    };
                })
            };

            assertIsNonNullable(roomState.mapSelected);

            const battle = BattleRunRoom(roomStateReady);

            stateManager.set({
                step: 'battle',
                battle
            });

        }, delay);

        stateManager.set({
            step: 'will-launch',
            launchTimeout
        });
    }
};
