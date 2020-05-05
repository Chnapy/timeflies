import { MapPlacementTile, PlayerRoom, RoomServerAction, seedTiledMap, ErrorServerAction } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('on map select request', () => {

    const { getRoomStateWithTwoPlayers, createRoomWithCreator, createRoom, createMapConfig } = RoomTester;

    const getMapInfos = (mapId: string, nbrTeams: number): [
        Parameters<typeof createRoom>[ 1 ],
        Parameters<typeof createRoom>[ 2 ]
    ] => [
            [ createMapConfig(mapId, nbrTeams) ],
            () => Promise.resolve(seedTiledMap('map_1'))
        ];

    describe('should fail if', () => {

        it('player is not admin', async () => {

            const { receive, sendList } = createRoomWithCreator('p1', false);

            createRoom(undefined, ...getMapInfos('m1', 2));

            await receive({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            });

            expect(sendList).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });

        it('player is ready', async () => {

            const { receiveJ1, sendListJ1, j1Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            j1Infos.player.isReady = true;

            createRoom(...getMapInfos('m1', 2));

            await receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            });

            expect(sendListJ1).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });

        it('map does not exist', async () => {

            const { receiveJ1, sendListJ1, j1Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            j1Infos.player.isReady = true;

            createRoom(...getMapInfos('m1', 2));

            await receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'fake'
            });

            expect(sendListJ1).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });
    });

    describe('on request success, should notify', () => {

        it('with selected map', async () => {

            const { receiveJ1, sendListJ1, sendListJ2, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            createRoom(...getMapInfos('m1', 2));

            await receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            });

            const expectedSend = expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                type: 'room/map/select',
                mapSelected: {
                    id: 'm1',
                    placementTileList: expect.arrayContaining([
                        expect.objectContaining<MapPlacementTile>({
                            teamId: expect.any(String),
                            position: expect.any(Object)
                        })
                    ])
                }
            });

            expect(sendListJ1).toContainEqual(expectedSend);
            expect(sendListJ2).toContainEqual(expectedSend);
        });

        it('with created team list', async () => {

            const { receiveJ1, sendListJ1, sendListJ2, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            createRoom(...getMapInfos('m1', 2));

            await receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            });

            const expectedSend = expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                type: 'room/map/select',
                sendTime: expect.anything(),
                teamList: [
                    {
                        id: expect.any(String),
                        letter: 'A',
                        playersIds: []
                    },
                    {
                        id: expect.any(String),
                        letter: 'B',
                        playersIds: []
                    }
                ]
            });

            expect(sendListJ1).toContainEqual(expectedSend);
            expect(sendListJ2).toContainEqual(expectedSend);
        });

        it('with reseted player list', async () => {

            const { receiveJ1, sendListJ1, sendListJ2, j2Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            j2Infos.player.isReady = true;

            createRoom(...getMapInfos('m1', 2));

            await receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            });

            const expectedSend = expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                type: 'room/map/select',
                sendTime: expect.anything(),
                playerList: [
                    expect.objectContaining<Partial<PlayerRoom>>({
                        id: 'p1',
                        isReady: false
                    }),
                    expect.objectContaining<Partial<PlayerRoom>>({
                        id: 'p2',
                        isReady: false
                    }),
                ]
            });

            expect(sendListJ1).toContainEqual(expectedSend);
            expect(sendListJ2).toContainEqual(expectedSend);
        });
    });
});
