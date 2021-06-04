import { RoomInfos, RoomListGetListMessage } from '@timeflies/socket-messages';
import { createFakeRoom } from '../../room/room-service-test-utils';
import { getFakeRoomListEntities } from '../room-list-service-test-utils';
import { GetRoomListService } from './get-room-list-service';

describe('get room-list service', () => {

    describe('on get-list message', () => {
        it('answer with room list', async () => {
            const { socketCellP1, connectSocket, globalEntities } = getFakeRoomListEntities(GetRoomListService);

            const room = createFakeRoom();
            globalEntities.currentRoomMap.mapById[ room.roomId ] = room;

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomListGetListMessage);

            await listener(RoomListGetListMessage({}).get(), socketCellP1.send);

            expect(socketCellP1.send).toHaveBeenCalledWith(
                RoomListGetListMessage.createResponse(expect.any(String), expect.arrayContaining<RoomInfos>([ {
                    roomId: 'room',
                    map: {
                        mapId: 'm1',
                        name: 'm1'
                    },
                    nbrPlayers: 3,
                    playerAdmin: {
                        playerId: 'p1',
                        playerName: 'p1'
                    },
                    state: 'open'
                } ]))
            );
        });
    });
});
