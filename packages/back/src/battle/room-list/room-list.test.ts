import { RoomListServerAction } from '@timeflies/shared';
import { WSSocket } from '../../transport/ws/WSSocket';
import { seedWebSocket } from '../../transport/ws/WSSocket.seed';
import { IPlayerRoomData, Room } from '../room/room';
import { RoomList } from './room-list';

describe('# room list', () => {

    const getPlayer = (id: string) => {
        const { ws, sendList, receive } = seedWebSocket();
        const socket = new WSSocket(ws);

        const player: IPlayerRoomData<WSSocket> = {
            id: 'p1',
            name: 'p1',
            socket
        };

        return {
            player,
            sendList,
            receive
        };
    };

    it('should send room list on player connect', () => {

        const roomList = RoomList();

        const { player, sendList } = getPlayer('p1');

        roomList.onPlayerConnect(player);

        expect(sendList).toEqual<[ RoomListServerAction.List ]>([ {
            type: 'room-list/list',
            sendTime: expect.anything(),
            list: []
        } ]);
    });

    it('should send room list on player request', async () => {

        const roomList = RoomList();

        const { player, sendList, receive } = getPlayer('p1');

        roomList.onPlayerConnect(player);

        sendList.length = 0;

        await receive({
            type: 'room-list/list/request',
            sendTime: -1
        });

        expect(sendList).toEqual<[ RoomListServerAction.List ]>([ {
            type: 'room-list/list',
            sendTime: expect.anything(),
            list: []
        } ]);
    });

    it('should create room on player request', async () => {

        const createRoom = jest.fn(Room);

        const roomList = RoomList({
            initialList: [],
            createRoom
        });

        const { player, receive } = getPlayer('p1');

        roomList.onPlayerConnect(player);

        await receive({
            type: 'room-list/create',
            sendTime: -1
        });

        expect(createRoom).toHaveBeenCalledTimes(1);
    });

    it('should join player to room on player request', async () => {

        const onJoin = jest.fn();

        const roomList = RoomList({
            initialList: [ {
                id: 'r1',
                getMapSelected: () => null,
                getOpenState: () => 'open',
                getPlayerList: () => [ {
                    id: 'p1',
                    characters: [],
                    isAdmin: true,
                    isLoading: false,
                    isReady: false,
                    name: 'p1'
                } ],
                onJoin
            } ],
            createRoom: Room
        });

        const { player, receive } = getPlayer('p2');

        roomList.onPlayerConnect(player);

        await receive({
            type: 'room-list/join',
            sendTime: -1,
            roomId: 'r1'
        });

        expect(onJoin).toHaveBeenCalledTimes(1);
    });

    it('should send updated list after room created', async () => {

        const roomList = RoomList({
            initialList: [],
            createRoom: (...args) => {
                const room = Room(...args);
                room.id = 'id';

                return room;
            }
        });

        const { player: p1, receive: receiveP1 } = getPlayer('p1');
        const { player: p2, receive: receiveP2, sendList: sendListP2 } = getPlayer('p2');

        roomList.onPlayerConnect(p1);
        roomList.onPlayerConnect(p2);

        await receiveP1({
            type: 'room-list/create',
            sendTime: -1
        });

        await receiveP2({
            type: 'room-list/list/request',
            sendTime: -1
        });

        expect(sendListP2).toContainEqual<RoomListServerAction.List>({
            type: 'room-list/list',
            sendTime: expect.anything(),
            list: [ expect.objectContaining({ id: 'id' }) ]
        });
    });

});
