import { RoomListener } from './room';
import { RoomClientAction, RoomServerAction } from '@timeflies/shared';

export const getRoomMapList: RoomListener<RoomClientAction.MapList> = ({
    playerData: { socket }, getPlayerRoom, dataManager
}) => () => {

    const player = getPlayerRoom();

    if (player.isReady) {
        throw new Error();
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
