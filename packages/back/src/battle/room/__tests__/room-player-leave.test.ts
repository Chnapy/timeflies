import { RoomServerAction, TeamRoom, PlayerRoom } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';

describe('# room > on player leave', () => {

    const { createPlayer, createRoom, createRoomWithMap, createRoomWithMapMinCharacters } = RoomTester;

    describe('should send to every one the action', () => {

        it('with reason: leave', async () => {

            const { ws: ws1, sendList: sendListJ1 } = seedWebSocket();

            const creator = createPlayer('p1', ws1);

            const room = createRoom(creator);

            const { ws: ws2, receive: receiveJ2 } = seedWebSocket();

            const newPlayer = createPlayer('p2', ws2);

            room.onJoin(newPlayer);

            await receiveJ2({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerId: newPlayer.id,
                    reason: 'leave',
                })
            ]);

            expect(sendListJ1).toEqual(expected);
        });

        it('with player list, all not-ready', async () => {

            const { receiveJ1, receiveJ2, sendListJ1 } = await createRoomWithMapMinCharacters('p1', 'p2', 'm1');

            await receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isReady: true,
                isLoading: false
            });

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

            const { receiveJ1, sendListJ2 } = await createRoomWithMapMinCharacters('p1', 'p2', 'm1');

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

            const { receiveJ2, sendListJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

            receiveJ2({
                type: 'room/player/leave',
                sendTime: -1
            });

            const expected = expect.arrayContaining([
                expect.objectContaining<Partial<RoomServerAction.PlayerSet>>({
                    type: 'room/player/set',
                    action: 'remove',
                    playerId: 'p2',
                    teams: expect.arrayContaining([
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

        const { ws: ws1, sendList: sendListJ1 } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        const room = createRoom(creator);

        const { ws: ws2, close: closeJ2 } = seedWebSocket();

        const newPlayer = createPlayer('p2', ws2);

        room.onJoin(newPlayer);

        closeJ2();

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

        const { ws: ws1, receive: receiveJ1 } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        const room = createRoom(creator);

        const { ws: ws2, sendList: sendListJ2, receive: receiveJ2 } = seedWebSocket();

        const newPlayer = createPlayer('p2', ws2);

        room.onJoin(newPlayer);

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

        const { ws: ws1, sendList: sendListJ1 } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        const room = createRoom(creator);

        const { ws: ws2, receive: receiveJ2 } = seedWebSocket();

        const newPlayer = createPlayer('p2', ws2);

        room.onJoin(newPlayer);

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

    it.todo('should close the room on all players leave');
});
