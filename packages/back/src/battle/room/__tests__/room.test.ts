import { RoomServerAction } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';


describe('# room', () => {

    const { createRoom, createPlayer } = RoomTester;

    it('should send the initial state on room creation', () => {

        const { ws, sendList } = seedWebSocket();

        const creator = createPlayer('p1', ws);

        createRoom(creator);

        expect(sendList).toContainEqual<RoomServerAction.RoomCreate>({
            type: 'room/create',
            sendTime: expect.anything()
        });
        expect(sendList).toContainEqual<RoomServerAction.PlayerSet>({
            type: 'room/player/set',
            sendTime: expect.anything(),
            action: 'add',
            player: {
                id: 'p1',
                name: 'p1',
                isAdmin: true,
                isLoading: false,
                isReady: false,
                characters: []
            },
            teams: []
        });
    });
});
