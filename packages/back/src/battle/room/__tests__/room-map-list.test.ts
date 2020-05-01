import { RoomTester } from './room-tester';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomServerAction } from '@timeflies/shared';

describe('# room > on map list request', () => {

    const { createPlayer, createRoom, createRoomWithMapMinCharacters } = RoomTester;

    it('should fail if player is ready', async () => {

        const { receiveJ1 } = await createRoomWithMapMinCharacters('p1', 'p2', 'm1');

        await receiveJ1({
            type: 'room/player/state',
            sendTime: -1,
            isReady: true,
            isLoading: false
        });

        await expect(receiveJ1({
            type: 'room/map/list',
            sendTime: -1
        })).rejects.toBeDefined();
    });

    it('should send updated map list', async () => {

        const { ws: ws1, sendList: sendListJ1, receive } = seedWebSocket();

        const creator = createPlayer('p1', ws1);

        createRoom(creator, [
            {
                id: 'm1',
                name: 'Map 1',
                width: 10,
                height: 12,
                nbrTeams: 2,
                nbrCharactersPerTeam: 3,
                previewUrl: '',
                schemaUrl: ''
            }
        ]);

        await receive({
            type: 'room/map/list',
            sendTime: -1
        });

        expect(sendListJ1).toContainEqual<RoomServerAction.MapList>({
            type: 'room/map/list',
            sendTime: expect.anything(),
            mapList: [ {
                id: 'm1',
                name: 'Map 1',
                width: 10,
                height: 12,
                nbrTeams: 2,
                nbrCharactersPerTeam: 3,
                previewUrl: '',
                schemaUrl: ''
            } ]
        });
    });

});
