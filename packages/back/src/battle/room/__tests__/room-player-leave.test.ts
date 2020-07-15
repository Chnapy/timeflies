import { RoomServerAction, TeamRoom, PlayerRoom, TimerTester } from '@timeflies/shared';
import { RoomTester } from './room-tester';
import { waitTimeoutPool } from '../../../wait-timeout-pool';

describe('# room > on player leave', () => {

    const timerTester = new TimerTester();

    const { getRoomStateWithMap, getRoomStateWithTwoPlayers } = RoomTester;

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    describe('should send to every one the action', () => {

        it('with reason: leave', async () => {

            const { receiveJ2, sendListJ1, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            createRoom();

            await receiveJ2({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerId: 'p2',
                    reason: 'leave',
                })
            ]);

            expect(sendListJ1).toEqual(expected);
        });

        it('with player list, all not-ready', async () => {

            const { receiveJ2, sendListJ1, j1Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            j1Infos.player.isReady = true;

            createRoom();

            await receiveJ2({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerList: [
                        expect.objectContaining<Partial<PlayerRoom>>({
                            id: 'p1',
                            isReady: false,
                        })
                    ]
                })
            ]);

            expect(sendListJ1).toEqual(expected);
        });

        it('with player list, new admin if previous one leaved', async () => {

            const { receiveJ1, sendListJ2, j1Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

            j1Infos.player.isReady = true;

            createRoom();

            await receiveJ1({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerList: [ expect.objectContaining<Partial<PlayerRoom>>({
                        id: 'p2',
                        isAdmin: true,
                    }) ]
                })
            ]);

            expect(sendListJ2).toEqual(expected);
        });

        it('with new team list', async () => {

            const { receiveJ2, sendListJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            await receiveJ2({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerId: 'p2',
                    teamList: expect.arrayContaining([
                        expect.not.objectContaining<Partial<TeamRoom>>({
                            playersIds: [ 'p2' ]
                        })
                    ])
                })
            ]);

            expect(sendListJ1).toEqual(expected);
        });
    });

    it('should handle player disconnects', async () => {

        const { sendListJ1, j2Infos, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

        createRoom();

        j2Infos.close();

        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                type: 'room/player/set',
                action: 'remove',
                playerId: 'p2',
                reason: 'disconnect'
            })
        ]);

        expect(sendListJ1).toEqual(expected);
    });

    it('should not send other message to leaved player', async () => {

        const { receiveJ1, receiveJ2, sendListJ2, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

        createRoom();

        await receiveJ2({
            type: 'room/player/leave',
            sendTime: -1
        });

        sendListJ2.splice(0, sendListJ2.length);

        await receiveJ1({
            type: 'room/player/state',
            sendTime: -1,
            isReady: false,
            isLoading: false
        });

        expect(sendListJ2).toHaveLength(0);
    });

    it('should not handle messages from leaved players', async () => {

        const { receiveJ2, sendListJ1, createRoom } = getRoomStateWithTwoPlayers('p1', 'p2');

        createRoom();

        await receiveJ2({
            type: 'room/player/leave',
            sendTime: -1
        });

        sendListJ1.splice(0, sendListJ1.length);

        await receiveJ2({
            type: 'room/player/state',
            sendTime: -1,
            isReady: false,
            isLoading: false
        });

        expect(sendListJ1).toHaveLength(0);
    });

    it('should cancel room launch on player leave', async () => {
        const { createRoom, initialState, receiveJ2, sendListJ1 } = getRoomStateWithTwoPlayers('p1', 'p2');

        initialState.step = 'will-launch';
        initialState.launchTimeout = waitTimeoutPool.createTimeout(10);

        createRoom();

        await receiveJ2({
            type: 'room/player/leave',
            sendTime: -1
        });
    
        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.BattleLaunch>>({
                type: 'room/battle-launch',
                action: 'cancel'
            })
        ]);

        expect(sendListJ1).toEqual(expected);
    });

    it.todo('should close the room on all players leave');
});
