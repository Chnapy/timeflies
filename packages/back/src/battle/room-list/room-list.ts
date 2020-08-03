import { RoomListClientAction, RoomListItem, RoomListServerAction, removeFromArray } from '@timeflies/shared';
import { WSError } from '../../transport/ws/WSError';
import { WSSocket } from '../../transport/ws/WSSocket';
import { IPlayerRoomData, Room } from '../room/room';

export type RoomList = ReturnType<typeof RoomList>;

type Dependencies = {
    initialList: Room[];
    createRoom: typeof Room;
};

export const RoomList = ({ initialList, createRoom }: Dependencies = {
    initialList: [],
    createRoom: Room
}) => {

    const roomList: Room[] = [ ...initialList ];

    const removeRoom = (roomId: string) => {
        removeFromArray(roomList, room => room.id === roomId);
    };

    const getCurrentListAction = (): Omit<RoomListServerAction.List, 'sendTime'> => ({
        type: 'room-list/list',
        list: roomList.map(roomListItem)
    });

    return {
        // TODO should work as an api service, data should be sent on request only
        onPlayerConnect: (player: IPlayerRoomData<WSSocket>) => {

            const wsPool = player.socket.createPool();

            // send current list
            wsPool.send(getCurrentListAction());

            // then, send current list if requested
            wsPool.on('room-list/list/request', () => {
                wsPool.send(getCurrentListAction())
            });

            // receive room join
            wsPool.on<RoomListClientAction.Join>('room-list/join', ({ roomId }) => {
                const room = roomList.find(r => r.id === roomId);

                if (room?.getOpenState() !== 'open') {
                    throw new WSError(403, 'cannot join room that does not exist, or closed');
                }

                wsPool.close();

                room.onJoin(player);
            });

            // receive room create
            wsPool.on('room-list/create', () => {

                wsPool.close();

                const room = createRoom(
                    () => removeRoom(room.id)
                );
                roomList.push(room);

                room.onJoin(player);
            });
        },

    };
};

const roomListItem = (room: Room): RoomListItem => {
    const playerList = room.getPlayerList();
    const mapSelected = room.getMapSelected();

    const adminName = playerList.find(p => p.isAdmin)!.name;

    const mapName = mapSelected?.config.name;

    const nbrPlayersMax = mapSelected
        ? mapSelected.config.nbrCharactersPerTeam * mapSelected.config.nbrTeams
        : undefined;

    const nbrPlayersCurrent = playerList.length;

    const roomState = room.getOpenState();

    return {
        id: room.id,
        adminName,
        mapName,
        nbrPlayersMax,
        nbrPlayersCurrent,
        roomState
    };
};
