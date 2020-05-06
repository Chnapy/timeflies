import { RoomClientAction, RoomServerAction } from '@timeflies/shared';
import { RoomListener } from './room';

export const getRoomMapList: RoomListener<RoomClientAction.MapList> = ({
    playerData: { socket }, getPlayerRoom, dataManager, forbiddenError
}) => () => {

    const player = getPlayerRoom();

    if (player.isReady) {
        throw forbiddenError('player should not be ready');
    }

    socket.send<RoomServerAction.MapList>({
        type: 'room/map/list',
        mapList: dataManager.getMapConfigList()
            .map(c => ({
                ...c,
                schemaUrl: dataManager.urlTransform(c.schemaUrl).forClient()
            }))
    });
};
