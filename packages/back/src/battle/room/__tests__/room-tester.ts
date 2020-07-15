import { MapConfig, MapPlacementTile, PlayerRoom, seedTiledMap, TeamRoom, createPosition } from '@timeflies/shared';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { PlayerRoomDataConnected, Room, RoomDependencies, PlayerRoomData } from '../room';
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

type PlayerInfos = ReturnType<typeof seedWebSocket> & {
    playerDataRaw: PlayerRoomData;
    playerData: PlayerRoomDataConnected;
    player: PlayerRoom;
};

export const RoomTester = {

    createRoom: (
        initialState: Partial<RoomState> = {},
        mapConfigList: MapConfig[] = [],
        readFileMap: RoomDependencies[ 'readFileMap' ] = () => null as any
    ) => Room({
        initialState,
        dataManager: {
            urlTransform: (url) => ({
                forClient: () => url,
                forServer: () => url,
            }),
            getMapConfigList: () => mapConfigList
        },
        readFileMap
    }),

    createPlayer: (id: string, isAdmin: boolean): PlayerInfos => {
        const wsInfos = seedWebSocket();

        const socket = new WSSocket(wsInfos.ws);

        return {
            ...wsInfos,
            playerDataRaw: {
                id,
                name: id,
                socket
            },
            playerData: {
                id,
                name: id,
                socket: socket.createPool()
            },
            player: {
                id,
                name: id,
                isAdmin,
                isLoading: false,
                isReady: false,
                characters: []
            }
        };
    },

    createRoomWithCreator: (j1Id: string, isAdmin: boolean = true, mapConfigList?: MapConfig[]) => {
        const j1Infos = RoomTester.createPlayer(j1Id, isAdmin);

        const room = RoomTester.createRoom({
            playerDataList: [ j1Infos.playerData ],
            playerList: [ j1Infos.player ]
        }, mapConfigList);

        return {
            ...j1Infos,
            room
        };
    },

    createMapConfig,

    getRoomStateWithTwoPlayers: (j1Id: string, j2Id: string) => {
        const j1Infos = RoomTester.createPlayer(j1Id, true);

        const j2Infos = RoomTester.createPlayer(j2Id, false);

        const {
            player: j1, playerData: j1Data, sendList: sendListJ1, receive: receiveJ1
        } = j1Infos;

        const {
            player: j2, playerData: j2Data, sendList: sendListJ2, receive: receiveJ2
        } = j2Infos;

        const playerDataList: PlayerRoomDataConnected[] = [
            j1Data, j2Data
        ];

        const playerList: PlayerRoom[] = [
            j1, j2
        ];

        const initialState: Partial<RoomState> = {
            playerDataList,
            playerList,
        };

        const createRoom = (
            mapConfigList?: Parameters<typeof RoomTester.createRoom>[ 1 ],
            readFileMap?: Parameters<typeof RoomTester.createRoom>[ 2 ],
        ) => RoomTester.createRoom(
            initialState,
            mapConfigList,
            readFileMap
        );

        return {
            j1Infos,
            j2Infos,
            sendListJ1,
            sendListJ2,
            receiveJ1,
            receiveJ2,
            initialState,
            createRoom
        };
    },

    getRoomStateWithMap: (
        j1Id: string, j2Id: string,
        mapId: string, nbrTeams: number
    ) => {
        const j1Infos = RoomTester.createPlayer(j1Id, true);

        const j2Infos = RoomTester.createPlayer(j2Id, false);

        const {
            player: j1, playerData: j1Data, sendList: sendListJ1, receive: receiveJ1
        } = j1Infos;

        const {
            player: j2, playerData: j2Data, sendList: sendListJ2, receive: receiveJ2
        } = j2Infos;

        const playerDataList: PlayerRoomDataConnected[] = [
            j1Data, j2Data
        ];

        const playerList: PlayerRoom[] = [
            j1, j2
        ];

        const mapConfig = createMapConfig(mapId, nbrTeams);

        const map = seedTiledMap('map_1');

        const tilesTeamJ1: MapPlacementTile[] = [
            {
                teamId: 'A',
                position: createPosition(0, 0)
            },
            {
                teamId: 'A',
                position: createPosition(1, 1)
            }
        ];

        const tilesTeamJ2: MapPlacementTile[] = [
            {
                teamId: 'B',
                position: createPosition(2, 2)
            },
            {
                teamId: 'B',
                position: createPosition(3, 3)
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

        const roomId = 'room-id';

        const initialState: Partial<RoomState> = {
            id: roomId,
            mapSelected: {
                config: mapConfig,
                placementTileList: [
                    ...tilesTeamJ1,
                    ...tilesTeamJ2
                ]
            },
            teamList: [
                teamJ1,
                teamJ2
            ],
            playerDataList,
            playerList,
        };

        const createRoom = () => RoomTester.createRoom(
            initialState,
            [ mapConfig ],
            () => Promise.resolve(map)
        );

        return {
            j1Infos,
            j2Infos,
            sendListJ1,
            sendListJ2,
            receiveJ1,
            receiveJ2,
            teamJ1,
            teamJ2,
            tilesTeamJ1,
            tilesTeamJ2,
            mapConfig,
            roomId,
            initialState,
            createRoom
        };
    },

    getRoomStateWithMapMinCharacters: (j1Id: string, j2Id: string, mapId: string) => {

        const roomInfos = RoomTester.getRoomStateWithMap(j1Id, j2Id, mapId, 2);

        const { j1Infos, j2Infos, teamJ1, teamJ2 } = roomInfos;

        teamJ1.playersIds.push(j1Id);
        teamJ2.playersIds.push(j2Id);

        const { tilesTeamJ1, tilesTeamJ2 } = roomInfos;

        const [ firstTile, secondTile ] = tilesTeamJ1;

        const [ otherTeamTile ] = tilesTeamJ2;

        j1Infos.player.characters.push({
            id: 'c1',
            type: 'sampleChar1',
            position: firstTile.position,
        });

        j2Infos.player.characters.push({
            id: 'c2',
            type: 'sampleChar1',
            position: otherTeamTile.position,
        });

        // await receiveJ1({
        //     type: 'room/character/add',
        //     sendTime: -1,
        //     characterType: 'sampleChar1',
        //     position: firstTile.position
        // });

        // await receiveJ2({
        //     type: 'room/character/add',
        //     sendTime: -1,
        //     characterType: 'sampleChar1',
        //     position: otherTeamTile.position
        // });

        return {
            ...roomInfos,
            teamJ1,
            teamJ2,
            firstTile,
            secondTile
        };
    }
};
