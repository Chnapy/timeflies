import { RoomServerAction } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';

describe('# room > on player refresh request', () => {

    const { createPlayer, createRoom, createRoomWithMap, createRoomWithMapMinCharacters } = RoomTester;

    describe('should fail if', () => {

        it('player ready with no map selected', async () => {

            const { ws, receive } = seedWebSocket();

            const creator = createPlayer('p1', ws);

            createRoom(creator);

            await expect(receive({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            })).rejects.toBeDefined();
        });

        it('player loading with no map selected', async () => {

            const { ws, receive } = seedWebSocket();

            const creator = createPlayer('p1', ws);

            createRoom(creator);

            await expect(receive({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: true,
                isReady: false
            })).rejects.toBeDefined();
        });

        it('player ready without minimum characters placed (at least 2 teams)', async () => {

            const { receiveJ1, tilesTeamJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            });

            await expect(receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            })).rejects.toBeDefined();
        });
    });

    it('should send new player state loading with map selected', async () => {

        const { receiveJ1, sendListJ1, sendListJ2 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

        await receiveJ1({
            type: 'room/player/state',
            sendTime: -1,
            isLoading: true,
            isReady: false
        });

        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.PlayerRefresh>>({
                type: 'room/player/refresh',
                player: {
                    id: 'p1',
                    isAdmin: true,
                    isLoading: true,
                    isReady: false
                }
            })
        ]);

        expect(sendListJ1).toEqual(expected);
        expect(sendListJ2).toEqual(expected);
    });

    it('should send new player state ready with minimum characters placed', async () => {

        const { receiveJ1, sendListJ1, sendListJ2 } = await createRoomWithMapMinCharacters('p1', 'p2', 'm1');

        await receiveJ1({
            type: 'room/player/state',
            sendTime: -1,
            isLoading: true,
            isReady: true
        });

        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.PlayerRefresh>>({
                type: 'room/player/refresh',
                player: {
                    id: 'p1',
                    isAdmin: true,
                    isLoading: true,
                    isReady: true
                }
            })
        ]);

        expect(sendListJ1).toEqual(expected);
        expect(sendListJ2).toEqual(expected);
    });

});
