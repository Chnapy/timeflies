import { RoomListener } from './room';
import { RoomClientAction, RoomServerAction, assertIsNonNullable, removeFromArray } from '@timeflies/shared';

export const getRoomPlayerLeave: RoomListener<RoomClientAction.PlayerLeave> = ({
    playerData, stateManager, sendToEveryone, closeRoom
}) => {

    const { id, socket } = playerData;

    const onPlayerLeave = (reason: 'leave' | 'disconnect') => {

        const mutable = stateManager.clone('teamList', 'playerList');

        const team = mutable.teamList.find(t => t.playersIds.includes(id));

        if (team) {
            team.playersIds = team.playersIds.filter(pid => pid !== id);
        }

        const playerDeleted = removeFromArray(mutable.playerList, p => p.id === id);

        if(!playerDeleted) {
            throw new Error();
        }

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

        if(!mutable.playerList.length) {
            // no more players, closing room
            closeRoom();
        }

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