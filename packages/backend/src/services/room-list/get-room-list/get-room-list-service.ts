import { RoomInfos, RoomListGetListMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { Room } from '../../room/room';
import { Service } from '../../service';

export class GetRoomListService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomListGetListMessageListener(socketCell);
    };

    private addRoomListGetListMessageListener = (socketCell: SocketCell) => socketCell.addMessageListener<typeof RoomListGetListMessage>(
        RoomListGetListMessage, ({ requestId }, send) => {

            const roomList = Object.values(this.globalEntitiesNoServices.currentRoomMap.mapById)
            .filter((room): room is Room => !!room);

            const listData = roomList.map((room): RoomInfos => {

                const { mapInfos, staticPlayerList, playerAdminId } = room;

                const playerAdminName = staticPlayerList.find(player => player.playerId === playerAdminId)!.playerName;

                return {
                    roomId: room.roomId,
                    map: mapInfos && {
                        mapId: mapInfos.mapId,
                        name: mapInfos.name
                    },
                    nbrPlayers: staticPlayerList.length,
                    playerAdmin: {
                        playerId: playerAdminId,
                        playerName: playerAdminName
                    },
                    state: room.battle
                        ? 'in-battle'
                        : 'open'
                };
            });

            send(RoomListGetListMessage.createResponse(requestId, listData));
        });
}
