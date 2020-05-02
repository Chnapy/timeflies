import { RoomServerAction, PlayerRoom } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('# room > on player join', () => {

    const { createRoom, createPlayer, createRoomWithCreator, getRoomStateWithMap } = RoomTester;

    it('should notify first player join as admin', async () => {

        const { playerDataRaw, sendList } = createPlayer('p1', true);

        const room = createRoom();

        room.onJoin(playerDataRaw);

        expect(sendList).toContainEqual<RoomServerAction.PlayerSet>({
            type: 'room/player/set',
            action: 'add',
            sendTime: expect.anything(),
            player: expect.objectContaining<Partial<PlayerRoom>>({
                id: 'p1',
                isAdmin: true,
            }),
            teamList: []
        });
    });

    it('should notify next players joins as no-admin', async () => {

        const { room, sendList: sendListJ1 } = createRoomWithCreator('p1');

        const { playerDataRaw } = createPlayer('p2', true);

        room.onJoin(playerDataRaw);

        expect(sendListJ1).toContainEqual<RoomServerAction.PlayerSet>({
            type: 'room/player/set',
            action: 'add',
            sendTime: expect.anything(),
            player: expect.objectContaining<Partial<PlayerRoom>>({
                id: 'p2',
                isAdmin: false,
            }),
            teamList: []
        });
    });

    it('should notify everyone of new player join', () => {

        const { room, sendList: sendListJ1 } = createRoomWithCreator('p1');

        const { playerDataRaw, sendList: sendListJ2 } = createPlayer('p2', false);

        room.onJoin(playerDataRaw);

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
            teamList: []
        };

        expect(sendListJ1).toContainEqual(expectedSend);
        expect(sendListJ2).not.toContainEqual(expectedSend);
    });

    it('should send all the room state to new player join', async () => {

        const { createRoom, tilesTeamJ1, tilesTeamJ2, j1Infos, j2Infos, teamJ1, teamJ2 } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

        const room = createRoom();

        const { player: j3, playerDataRaw, sendList: sendListJ3 } = createPlayer('p3', false);

        room.onJoin(playerDataRaw);

        const expectedSend: RoomServerAction.RoomState = {
            type: 'room/state',
            sendTime: expect.anything(),
            mapSelected: {
                id: 'm1',
                placementTileList: [
                    ...tilesTeamJ1, ...tilesTeamJ2
                ]
            },
            playerList: [
                j1Infos.player,
                j2Infos.player,
                j3
            ],
            teamList: [
                teamJ1, teamJ2
            ]
        };

        expect(sendListJ3).toContainEqual(expectedSend);
    });
});
