import { PlayerId } from '@timeflies/common';
import { RoomStateData, RoomStateMessage } from '@timeflies/socket-messages';
import { Service } from '../service';
import { Room } from './room';

export abstract class RoomAbstractService extends Service {

    protected getRoomStateData = ({
        roomId,
        mapInfos,
        teamColorList,
        playerAdminId,
        staticPlayerList,
        staticCharacterList,
        mapPlacementTiles
    }: Room): RoomStateData => {
        return {
            roomId, teamColorList, playerAdminId, staticPlayerList, staticCharacterList, mapPlacementTiles,
            mapInfos: mapInfos && this.services.mapRoomService.getMapInfosFrontend(mapInfos)
        };
    };

    protected sendRoomStateToEveryPlayersExcept = (currentPlayerId: PlayerId) => {
        const room = this.getRoomByPlayerId(currentPlayerId);

        this.sendToEveryPlayersExcept(
            RoomStateMessage(this.getRoomStateData(room)),
            room.staticPlayerList,
            currentPlayerId
        );
    };
}
