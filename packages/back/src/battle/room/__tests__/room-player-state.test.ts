import { RoomServerAction, ErrorServerAction, TimerTester } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('# room > on player state request', () => {

    const timerTester = new TimerTester();

    const { getRoomStateWithMap, getRoomStateWithMapMinCharacters, createRoomWithCreator } = RoomTester;

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    describe('should fail if', () => {

        it('player ready with no map selected', async () => {

            const { receive, sendList } = createRoomWithCreator('p1');

            await receive({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            });

            expect(sendList).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });

        it('player loading with no map selected', async () => {

            const { receive, sendList } = createRoomWithCreator('p1');

            await receive({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: true,
                isReady: false
            });

            expect(sendList).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });

        it('player ready without minimum characters placed (at least 2 teams)', async () => {

            const { receiveJ1, sendListJ1, tilesTeamJ1, createRoom, j1Infos } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            j1Infos.player.characters.push({
                id: 'c1',
                type: 'sampleChar1',
                position: firstTile.position
            });

            createRoom();

            await receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            });

            expect(sendListJ1).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });

        it('player loading & ready with room step at will-launch', async () => {

            const { createRoom, receiveJ1, sendListJ1, initialState } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');

            initialState.step = 'will-launch';

            createRoom();

            await receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: true,
                isReady: true
            });

            expect(sendListJ1).toContainEqual<ErrorServerAction>({
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            });
        });
    });

    it('should send new player state loading with map selected', async () => {

        const { receiveJ1, sendListJ1, sendListJ2, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

        createRoom();

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

        const { receiveJ1, sendListJ1, sendListJ2, createRoom } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');

        createRoom();

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

    describe('when everyone state is ready and not loading', () => {

        it('should send to everyone launch time', async () => {

            const { receiveJ2, sendListJ1, sendListJ2, createRoom, j1Infos } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');
    
            j1Infos.player.isReady = true;

            createRoom();
    
            await receiveJ2({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            });
    
            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.BattleLaunch>>({
                    type: 'room/battle-launch',
                    action: 'launch',
                    launchTime: expect.any(Number)
                })
            ]);
    
            expect(sendListJ1).toEqual(expected);
            expect(sendListJ2).toEqual(expected);
        });

        it('should cancel launch on player state change to not ready', async () => {

            const { receiveJ2, sendListJ1, sendListJ2, createRoom, j1Infos } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');
    
            j1Infos.player.isReady = true;

            createRoom();
    
            await receiveJ2({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: true
            });

            await timerTester.advanceBy(100);
    
            await receiveJ2({
                type: 'room/player/state',
                sendTime: -1,
                isLoading: false,
                isReady: false
            });
    
            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.BattleLaunch>>({
                    type: 'room/battle-launch',
                    action: 'cancel'
                })
            ]);
    
            expect(sendListJ1).toEqual(expected);
            expect(sendListJ2).toEqual(expected);

            // TODO check that battle was not launched
        });

        it.todo('should launch battle after delay');
    });
});
