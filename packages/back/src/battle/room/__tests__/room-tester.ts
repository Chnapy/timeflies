import { MapConfig, MapPlacementTile, seedTiledMap, TeamRoom } from '@timeflies/shared';
import WebSocket from 'ws';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { PlayerRoomData, Room, RoomDependencies } from '../room';
import { RoomState } from '../room-state-manager';

const createMapConfig = (id: string, nbrTeams: number): MapConfig => ({
    id,
    name: id,
    width: 10,
    height: 12,
    nbrTeams,
    nbrCharactersPerTeam: 3,
    previewUrl: '',
    schemaUrl: ''
});

export const RoomTester = {

    createRoom: (
        creator: PlayerRoomData,
        mapConfigList: MapConfig[] = [],
        readFileMap: RoomDependencies[ 'readFileMap' ] = () => null as any,
        initialState: Partial<RoomState> = {}
    ) => Room(creator, {
        initialState,
        dataManager: {
            getMapConfigList: () => mapConfigList
        },
        readFileMap
    }),

    createPlayer: (id: string, ws: WebSocket): PlayerRoomData => ({
        id,
        name: id,
        socket: new WSSocket(ws),
    }),

    createMapConfig,

    createRoomWithMap: async (
        j1Id: string, j2Id: string, mapId: string, nbrTeams: number,
        initialState: Partial<RoomState> = {}
    ) => {

        const { ws: ws1, sendList: sendListJ1, receive: receiveJ1 } = seedWebSocket();

        const creator = RoomTester.createPlayer(j1Id, ws1);

        const mapConfig = createMapConfig(mapId, nbrTeams);

        const map = seedTiledMap('map_1');

        const tilesTeamJ1: MapPlacementTile[] = [
            {
                teamId: 'A',
                position: { x: 0, y: 0 }
            },
            {
                teamId: 'A',
                position: { x: 1, y: 1 }
            }
        ];

        const tilesTeamJ2: MapPlacementTile[] = [
            {
                teamId: 'B',
                position: { x: 2, y: 2 }
            },
            {
                teamId: 'B',
                position: { x: 3, y: 3 }
            }
        ];

        const teamJ1: TeamRoom = {
            id: 'A',
            letter: 'A',
            playersIds: []
        };

        const teamJ2: TeamRoom = {
            id: 'B',
            letter: 'B',
            playersIds: []
        };

        const room = RoomTester.createRoom(creator, [ mapConfig ],
            () => Promise.resolve(map),
            {
                mapSelected: {
                    config: mapConfig,
                    placementTiles: [
                        ...tilesTeamJ1,
                        ...tilesTeamJ2
                    ]
                },
                teamList: [
                    teamJ1,
                    teamJ2
                ],
                ...initialState
            }
        );

        const { ws: ws2, sendList: sendListJ2, receive: receiveJ2 } = seedWebSocket();

        const newPlayer = RoomTester.createPlayer(j2Id, ws2);

        room.onJoin(newPlayer);

        return {
            sendListJ1,
            sendListJ2,
            receiveJ1,
            receiveJ2,
            teamJ1,
            teamJ2,
            tilesTeamJ1,
            tilesTeamJ2
        };
    },

    createRoomWithMapMinCharacters: async (j1Id: string, j2Id: string, mapId: string) => {

        const teamJ1: TeamRoom = {
            id: 'A',
            letter: 'A',
            playersIds: [ j1Id ]
        };

        const teamJ2: TeamRoom = {
            id: 'B',
            letter: 'B',
            playersIds: [ j2Id ]
        };

        const roomInfos = await RoomTester.createRoomWithMap(j1Id, j2Id, mapId, 2, {
            teamList: [ teamJ1, teamJ2 ]
        });

        const { receiveJ1, receiveJ2, tilesTeamJ1, tilesTeamJ2 } = roomInfos;

        const [ firstTile, secondTile ] = tilesTeamJ1;

        const [ otherTeamTile ] = tilesTeamJ2;

        await receiveJ1({
            type: 'room/character/add',
            sendTime: -1,
            characterType: 'sampleChar1',
            position: firstTile.position
        });

        await receiveJ2({
            type: 'room/character/add',
            sendTime: -1,
            characterType: 'sampleChar1',
            position: otherTeamTile.position
        });

        return {
            ...roomInfos,
            teamJ1,
            teamJ2,
            firstTile,
            secondTile
        };
    }
};
