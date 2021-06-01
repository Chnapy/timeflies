import { RoomListCreateRoomMessage } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { createFakeBattle } from '../../battle/battle-service-test-utils';
import { createFakeRoom } from '../../room/room-service-test-utils';
import { getFakeRoomListEntities } from '../room-list-service-test-utils';
import { CreateRoomListService } from './create-room-list-service';

describe('create room list-service', () => {

    describe('on create room message', () => {

        it('throw error if player already in room', () => {
            const { socketCellP1, connectSocket, globalEntities } = getFakeRoomListEntities(CreateRoomListService);

            const room = createFakeRoom();
            globalEntities.currentRoomMap.mapById[ room.roomId ] = room;
            globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ] = room;

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomListCreateRoomMessage);

            expect(() =>
                listener(RoomListCreateRoomMessage({}).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player already in battle', () => {
            const { socketCellP1, connectSocket, globalEntities } = getFakeRoomListEntities(CreateRoomListService);

            const battle = createFakeBattle();
            globalEntities.currentBattleMap.mapById[ battle.battleId ] = battle;
            globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ] = battle;

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomListCreateRoomMessage);

            expect(() =>
                listener(RoomListCreateRoomMessage({}).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('answer with room id', async () => {
            const { socketCellP1, connectSocket } = getFakeRoomListEntities(CreateRoomListService);

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomListCreateRoomMessage);

            await listener(RoomListCreateRoomMessage({}).get(), socketCellP1.send);

            expect(socketCellP1.send).toHaveBeenCalledWith(
                RoomListCreateRoomMessage.createResponse(expect.any(String), { roomId: expect.any(String) })
            );
        });

        it('add new room to global entities', async () => {
            const { socketCellP1, connectSocket, globalEntities } = getFakeRoomListEntities(CreateRoomListService);

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomListCreateRoomMessage);

            let roomId: string = '';
            socketCellP1.send = jest.fn((m: any) => roomId = m.payload.roomId);

            await listener(RoomListCreateRoomMessage({}).get(), socketCellP1.send);

            expect(globalEntities.currentRoomMap.mapById[ roomId ]).toMatchObject({ roomId: expect.any(String) });
        });
    });
});
