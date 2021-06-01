import { RoomListCreateRoomMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { createRoom } from '../../room/room';
import { Service } from '../../service';

export class CreateRoomListService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomListCreateRoomMessageListener(socketCell, currentPlayerId);
    };

    private addRoomListCreateRoomMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomListCreateRoomMessage>(
        RoomListCreateRoomMessage, ({ requestId }, send) => {

            if (this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ]) {
                throw new SocketError(400, 'Cannot create room if player already in another one.');
            }

            if (this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ]) {
                throw new SocketError(400, 'Cannot create room if player in battle.');
            }

            const room = createRoom({
                ...this.globalEntitiesNoServices,
                services: this.services
            });

            send(RoomListCreateRoomMessage.createResponse(requestId, { roomId: room.roomId }));

            this.globalEntitiesNoServices.currentRoomMap.mapById[ room.roomId ] = room;
        });
}
