import { RoomServerAction } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';

describe('# room > on player join', () => {

    const { createPlayer, createRoom } = RoomTester;

    it('should notify everyone of new player join', () => {

        const { ws: ws1, sendList: sendListJ1 } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        const room = createRoom(creator);

        const { ws: ws2, sendList: sendListJ2 } = seedWebSocket();

        const newPlayer = createPlayer('p2', ws2);

        room.onJoin(newPlayer);

        const expectedSend: RoomServerAction.PlayerSet = {
            type: 'room/player/set',
            sendTime: expect.anything(),
            action: 'add',
            player: {
                id: 'p2',
                name: 'p2',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            },
            teams: []
        };

        expect(sendListJ1).toContainEqual(expectedSend);
        expect(sendListJ2).toContainEqual(expectedSend);
    });

    it('should send all the room state to new player join', async () => {

        const { ws: ws1, sendList: sendListJ1, receive: receiveJ1 } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        const room = createRoom(creator);

        const { ws: ws2, sendList: sendListJ2 } = seedWebSocket();

        const newPlayer = createPlayer('p2', ws2);

        room.onJoin(newPlayer);

        const expectedSend: RoomServerAction.PlayerSet = {
            type: 'room/player/set',
            sendTime: expect.anything(),
            action: 'add',
            player: {
                id: 'p2',
                name: 'p2',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            },
            teams: []
        };

        expect(sendListJ2).toContainEqual(expectedSend);
    });
});
