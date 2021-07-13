import { ObjectTyped } from '@timeflies/common';
import { MapInfos, MapPlacementTiles, RoomMapListGetMessage, RoomMapSelectMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Layer, Tile } from '@timeflies/tilemap-utils';
import fs from 'fs';
import type { TiledMap } from 'tiled-types';
import util from 'util';
import { assetUrl } from '../../../utils/asset-url';
import { RoomAbstractService } from '../room-abstract-service';

export class MapRoomService extends RoomAbstractService {
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
            const { playerAdminId, staticPlayerList } = this.getRoomStateData(room);

            if (playerAdminId !== currentPlayerId) {
                throw new SocketError('bad-server-state', 'Player is not room admin: ' + currentPlayerId);
            }

            const staticPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (staticPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot change team if player ready: ' + currentPlayerId);
            }

            const mapList = getMapList();

            const mapInfos = mapList.find(m => m.mapId === payload.mapId);
            if (!mapInfos) {
                throw new SocketError('bad-request', 'Wrong map id: ' + payload.mapId);
            }

            room.mapInfos = mapInfos;
            room.staticCharacterList.forEach(character => {
                character.placement = null;
            });
            room.teamColorList = this.services.teamRoomService.getRoomTeamColorList(room);
            room.tiledMap = await this.loadTiledMap(mapInfos);
            room.mapPlacementTiles = await this.computeMapPlacementTiles(room.tiledMap, room.teamColorList);

            send(RoomMapSelectMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private loadTiledMap = async (mapInfos: MapInfos): Promise<TiledMap> => {
        const readFile = util.promisify(fs.readFile);

        const tiledMapRaw = await readFile(assetUrl.toBackend(mapInfos.schemaLink), 'utf-8');
        const tiledMap: TiledMap = JSON.parse(tiledMapRaw);

        return tiledMap;
    };

    private computeMapPlacementTiles = async (tiledMap: TiledMap, teamColorList: string[]): Promise<MapPlacementTiles> => {
        const placementLayer = Layer.getTilelayer('placement', tiledMap);
        const tilePositionsMap: MapPlacementTiles = {};

        (placementLayer.data as number[]).forEach((tileId, index) => {
            if (tileId) {
                tilePositionsMap[ tileId ] = tilePositionsMap[ tileId ] ?? [];
                tilePositionsMap[ tileId ].push(Tile.getTilePositionFromIndex(index, tiledMap));
            }
        });

        return ObjectTyped.entries(tilePositionsMap)
            .reduce<MapPlacementTiles>((acc, [ tileId, positionList ], index) => {

                acc[ teamColorList[ index ] ] = positionList;

                return acc;
            }, {});
    };

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
