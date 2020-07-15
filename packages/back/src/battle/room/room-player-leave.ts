import { RoomListener } from './room';
import { RoomClientAction, RoomServerAction, assertIsNonNullable } from '@timeflies/shared';

export const getRoomPlayerLeave: RoomListener<RoomClientAction.PlayerLeave> = ({
    playerData, stateManager, sendToEveryone
}) => {

    const { id, socket } = playerData;

    const onPlayerLeave = (reason: 'leave' | 'disconnect') => {

        const mutable = stateManager.clone('teamList', 'playerList');

        const team = mutable.teamList.find(t => t.playersIds.includes(id));

        if (team) {
            team.playersIds = team.playersIds.filter(pid => pid !== id);
        }

        const playerIndex = mutable.playerList.findIndex(p => p.id === id);
        if (playerIndex === -1) {
            throw new Error();
        }

        const [ playerDeleted ] = mutable.playerList.splice(
            playerIndex,
            1
        );

        if (playerDeleted.isAdmin) {
            if (mutable.playerList.length) {
                mutable.playerList[ 0 ].isAdmin = true;
            }
        }

        mutable.playerList.forEach(p => { p.isReady = false; });

        socket.close();

        stateManager.setFn(({ playerDataList }) => ({
            ...mutable,
            playerDataList: [ ...playerDataList ].filter(p => p.id !== id)
        }));

        const { step, launchTimeout } = stateManager.get();

        if (step === 'will-launch') {

            assertIsNonNullable(launchTimeout);

            launchTimeout.cancel();

            stateManager.set({
                step: 'idle',
                launchTimeout: null
            });

            sendToEveryone<RoomServerAction.BattleLaunch>({
                type: 'room/battle-launch',
                action: 'cancel'
            });
        }

        sendToEveryone<RoomServerAction.PlayerSet>({
            type: 'room/player/set',
            action: 'remove',
            playerId: id,
            reason,
            playerList: mutable.playerList,
            teamList: mutable.teamList
        });
    };

    socket.onDisconnect(() => onPlayerLeave('disconnect'));

    return () => onPlayerLeave('leave');
};