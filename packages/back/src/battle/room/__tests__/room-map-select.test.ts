import { MapPlacementTile, PlayerRoom, RoomServerAction, seedTiledMap } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';

describe('on map select request', () => {

    const { createPlayer, createRoom, createMapConfig } = RoomTester;

    const createRoomWithRealMap = async (
        j1Id: string, j2Id: string, mapId: string, nbrTeams: number
    ) => {

        const { ws: ws1, sendList: sendListJ1, receive: receiveJ1 } = seedWebSocket();

        const creator = RoomTester.createPlayer(j1Id, ws1);

        const mapConfig = createMapConfig(mapId, nbrTeams);

        const map = seedTiledMap('map_1');

        const room = RoomTester.createRoom(creator, [ mapConfig ],
            () => Promise.resolve(map)
        );

        const { ws: ws2, sendList: sendListJ2, receive: receiveJ2 } = seedWebSocket();

        const newPlayer = RoomTester.createPlayer(j2Id, ws2);

        room.onJoin(newPlayer);

        await receiveJ1({
            type: 'room/map/select',
            sendTime: -1,
            mapId
        });

        return {
            sendListJ1,
            sendListJ2,
            receiveJ1,
            receiveJ2,
        };
    };

    describe('should fail if', () => {

        it('player is not admin', async () => {

            const { ws: ws1, sendList: sendListJ1 } = seedWebSocket();

            const creator = createPlayer('p1', ws1);

            const room = createRoom(creator);

            const { ws: ws2, sendList: sendListJ2, receive: receiveJ2 } = seedWebSocket();

            const newPlayer = createPlayer('p2', ws2);

            room.onJoin(newPlayer);

            await expect(receiveJ2({
                type: 'room/map/select',
                sendTime: -1,
                mapId: '1'
            })).rejects.toBeDefined();

            const expected = expect.not.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                    type: 'room/map/select'
                })
            ]);

            expect(sendListJ1).toEqual(expected);
            expect(sendListJ2).toEqual(expected);
        });

        it('player is ready', async () => {

            const { receiveJ1, sendListJ1, receiveJ2 } = await createRoomWithRealMap('p1', 'p2', 'm1', 2);

            const { mapSelected } = sendListJ1.find((a): a is RoomServerAction.MapSelect => a.type === 'room/map/select')!;

            const [ firstTile, secondTile ] = mapSelected!.placementTiles;

            const [ otherTeamTile ] = mapSelected!.placementTiles.filter(t => t.teamId !== firstTile.teamId);

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            });

            await receiveJ2({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: otherTeamTile.position
            });

            await receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isReady: true,
                isLoading: false
            });

            await expect(receiveJ1({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'm1'
            })).rejects.toBeDefined();
        });

        it('map does not exist', async () => {

            const { ws: ws1, sendList: sendListJ1, receive } = seedWebSocket();

            const creator = createPlayer('p1', ws1);

            createRoom(creator);

            await expect(receive({
                type: 'room/map/select',
                sendTime: -1,
                mapId: 'fake'
            })).rejects.toBeDefined();

            const expected = expect.not.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                    type: 'room/map/select'
                })
            ]);

            expect(sendListJ1).toEqual(expected);
        });
    });

    describe('on request success, should notify', () => {

        it('with selected map', async () => {

            const { sendListJ1, sendListJ2 } = await createRoomWithRealMap('p1', 'p2', 'm1', 2);

            const expectedSend = expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                type: 'room/map/select',
                sendTime: expect.anything(),
                mapSelected: {
                    id: 'm1',
                    placementTiles: expect.arrayContaining([
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

            const { sendListJ1, sendListJ2 } = await createRoomWithRealMap('p1', 'p2', 'm1', 2);

            const expectedSend = expect.objectContaining<Partial<RoomServerAction.MapSelect>>({
                type: 'room/map/select',
                sendTime: expect.anything(),
                teams: [
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

            const { sendListJ1, sendListJ2 } = await createRoomWithRealMap('p1', 'p2', 'm1', 2);

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
