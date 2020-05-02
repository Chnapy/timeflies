import { RoomServerAction } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('# room > on map list request', () => {

    const { createPlayer, createRoomWithCreator, createRoom, getRoomStateWithMapMinCharacters } = RoomTester;

    it('should fail if player is ready', async () => {

        const { receiveJ1, j1Infos, createRoom } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');

        j1Infos.player.isReady = true;

        createRoom();

        await expect(receiveJ1({
            type: 'room/map/list',
            sendTime: -1
        })).rejects.toBeDefined();
    });

    it('should send updated map list', async () => {

        const { receive, sendList } = createRoomWithCreator('p1', true, [
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

        expect(sendList).toContainEqual<RoomServerAction.MapList>({
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

    it('should not send map list to other players', async () => {

        const { player: j1, playerData: j1Data, receive: receiveJ1 } = createPlayer('p1', true);
        const { player: j2, playerData: j2Data, sendList: sendListJ2 } = createPlayer('p2', false);

        createRoom(
            {
                playerDataList: [ j1Data, j2Data ],
                playerList: [ j1, j2 ]
            },
            [ {
                id: 'm1',
                name: 'Map 1',
                width: 10,
                height: 12,
                nbrTeams: 2,
                nbrCharactersPerTeam: 3,
                previewUrl: '',
                schemaUrl: ''
            } ]
        );

        await receiveJ1({
            type: 'room/map/list',
            sendTime: -1
        });

        expect(sendListJ2).not.toContainEqual(
            expect.objectContaining<Partial<RoomServerAction.MapList>>({
                type: 'room/map/list'
            })
        );
    });

});
