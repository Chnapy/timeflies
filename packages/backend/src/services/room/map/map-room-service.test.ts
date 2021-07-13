import { createPosition } from '@timeflies/common';
import { MapInfos, MapPlacementTiles, RoomMapListGetMessage, RoomMapSelectMessage, RoomStaticCharacter } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { getFakeRoomEntities } from '../room-service-test-utils';
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

        it('throw error if player not admin', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            room.playerAdminId = 'p2';

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

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: '#000',
                ready: true,
                type: 'player'
            } ];

            await expect(
                listener(RoomMapSelectMessage({
                    mapId: 'm1'
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('set map infos', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expect(room.mapInfos).toEqual<MapInfos>({
                mapId: 'm1',
                name: 'Dungeon',
                nbrTeams: 3,
                nbrTeamCharacters: 4,
                schemaLink: '/maps/1-map_dungeon.json',
                imagesLinks: {
                    "tiles_dungeon_v1.1": '/maps/map_dungeon.png'
                }
            });
        });

        it('reset characters placement', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: createPosition(1, 1)
                }
            ];

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([
                {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: null
                }
            ]);
        });

        it('set tiled map', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expect(room.tiledMap).toMatchObject({ layers: expect.any(Array) });
        });

        it('set map placement tiles', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomMapSelectMessage);

            await listener(RoomMapSelectMessage({
                mapId: 'm1'
            }).get(), socketCellP1.send);

            expect(room.mapPlacementTiles).toEqual<MapPlacementTiles>({
                '#3BA92A': expect.any(Array),
                '#A93B2A': expect.any(Array),
                '#FFD74A': expect.any(Array)
            });
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
    });
});
