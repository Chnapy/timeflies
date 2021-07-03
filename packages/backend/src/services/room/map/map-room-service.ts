import { ObjectTyped } from '@timeflies/common';
import { MapInfos, RoomMapListGetMessage, RoomMapSelectMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { assetUrl } from '../../../utils/asset-url';
import { Service } from '../../service';

export class MapRoomService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomMapListGetMessageListener(socketCell);
        this.addRoomMapSelectMessageListener(socketCell, currentPlayerId);
    }

    private addRoomMapListGetMessageListener = (socketCell: SocketCell) => socketCell.addMessageListener<typeof RoomMapListGetMessage>(
        RoomMapListGetMessage, ({ requestId }, send) => {

            const mapList = getMapList().map(this.getMapInfosFrontend);

            send(RoomMapListGetMessage.createResponse(requestId, mapList));
        });

    private addRoomMapSelectMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomMapSelectMessage>(
        RoomMapSelectMessage, async ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);
            const { playerAdminId, staticPlayerList } = room.getRoomStateData();

            if (playerAdminId !== currentPlayerId) {
                throw new SocketError('bad-server-state', 'Player is not room admin: ' + currentPlayerId);
            }

            const staticPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (staticPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot change team if player ready: ' + currentPlayerId);
            }

            const mapList = getMapList();

            const map = mapList.find(m => m.mapId === payload.mapId);
            if (!map) {
                throw new SocketError('bad-request', 'Wrong map id: ' + payload.mapId);
            }

            await room.mapSelect(map);

            send(RoomMapSelectMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    getMapInfosFrontend = (mapInfos: MapInfos) => {
        return {
            ...mapInfos,
            schemaLink: assetUrl.toFrontend(mapInfos.schemaLink),
            imagesLinks: ObjectTyped.entries(mapInfos.imagesLinks)
                .reduce<MapInfos[ 'imagesLinks' ]>((acc, [ key, value ]) => {
                    acc[ key ] = assetUrl.toFrontend(value);
                    return acc;
                }, {})
        };
    };
}

// MOCKs

const getMapList = (): MapInfos[] => [
    {
        mapId: 'm1',
        name: 'Dungeon',
        nbrTeams: 3,
        nbrTeamCharacters: 4,
        schemaLink: '/maps/1-map_dungeon.json',
        imagesLinks: {
            "tiles_dungeon_v1.1": '/maps/map_dungeon.png'
        }
    }
];
