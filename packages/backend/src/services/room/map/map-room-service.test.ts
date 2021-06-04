import { MapInfos, RoomMapListGetMessage, RoomMapSelectMessage } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { createFakeRoom, getFakeRoomEntities } from '../room-service-test-utils';
import { MapRoomService } from './map-room-service';

describe('map room service', () => {

    const getEntities = () => getFakeRoomEntities(MapRoomService);

    describe('on map list get message', () => {
        it('answers with map infos list', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapListGetMessage);

            await listener(RoomMapListGetMessage({}).get(), socketCellP1.send);

            expect(socketCellP1.send).toHaveBeenCalledWith(RoomMapListGetMessage.createResponse(
                expect.anything(),
                expect.arrayContaining<MapInfos>([ {
                    mapId: expect.any(String),
                    name: expect.any(String),
                    nbrTeams: expect.any(Number),
                    nbrTeamCharacters: expect.any(Number),
                    schemaLink: expect.any(String),
                    imagesLinks: expect.any(Object)
                } ])
            ));
        });
    });

    describe('on map select message', () => {

        it('throw error if map do not exist', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await expect(
                listener(RoomMapSelectMessage({
                    mapId: 'wrong-map-id'
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('throw error if player not master', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                playerAdminId: 'p2'
            }));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await expect(
                listener(RoomMapSelectMessage({
                    mapId: 'm1'
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('throw error if player is ready', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticPlayerList: [ {
                    playerId: 'p1',
                    playerName: '',
                    teamColor: '#000',
                    ready: true
                } ]
            }));

            await expect(
                listener(RoomMapSelectMessage({
                    mapId: 'm1'
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomMapSelectMessage);
        });

        it('map select, before answering', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            const callOrder: string[] = [];

            socketCellP1.send = jest.fn(message => callOrder.push(message.action));
            room.mapSelect = jest.fn(async () => { callOrder.push('map-select'); });

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expect(room.mapSelect).toHaveBeenCalledWith(
                expect.objectContaining<Partial<MapInfos>>({
                    mapId: 'm1'
                })
            );
            expect(callOrder).toEqual([ 'map-select', RoomMapSelectMessage.action ]);
        });
    });
});
