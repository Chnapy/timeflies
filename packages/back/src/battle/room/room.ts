import { DeepReadonly, MapConfig, PlayerRoom, RoomClientAction, RoomServerAction, TiledMap, ServerAction, DistributiveOmit } from '@timeflies/shared';
import fs from 'fs';
import util from 'util';
import { WSSocket, WSSocketPool } from '../../transport/ws/WSSocket';
import { getRoomCharacterAdd } from './room-character-add';
import { getRoomCharacterRemove } from './room-character-remove';
import { getRoomMapList } from './room-map-list';
import { getRoomMapSelect } from './room-map-select';
import { getRoomPlayerLeave } from './room-player-leave';
import { getRoomPlayerState } from './room-player-state';
import { RoomStateManager, RoomState } from './room-state-manager';

type RoomListenerDependencies = {
    playerData: PlayerRoomDataConnected;
    sendToEveryone: WSSocket[ 'send' ];
    stateManager: RoomStateManager;
    dataManager: {
        getMapConfigList: () => MapConfig[];
    };
    readFileMap: (url: string) => Promise<TiledMap>;
    getPlayerRoom: () => DeepReadonly<PlayerRoom>;
};

export type RoomListener<A extends RoomClientAction> = (deps: RoomListenerDependencies) => (action: A) => void | Promise<void>;

const readFile = util.promisify(fs.readFile);

const getMapConfigList = (): MapConfig[] => [
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
];

type IPlayerRoomData<S> = {
    id: string;
    name: string;
    socket: S;
};

export type PlayerRoomData = IPlayerRoomData<WSSocket>;

export type PlayerRoomDataConnected = IPlayerRoomData<WSSocketPool>;

export type RoomDependencies = {
    initialState: Partial<RoomState>;
    dataManager: {
        getMapConfigList: () => MapConfig[];
    };
    readFileMap: (url: string) => Promise<TiledMap>;
};

export type Room = ReturnType<typeof Room>;

export const Room = ({ initialState, dataManager, readFileMap }: RoomDependencies = {
    initialState: {},
    dataManager: {
        getMapConfigList
    },
    readFileMap: async url => {

        const schemaRaw = await readFile(url, 'utf8');

        return JSON.parse(schemaRaw);
    }
}) => {

    const stateManager = RoomStateManager(initialState);

    const addNewPlayer = ({ id, name, socket }: PlayerRoomData, isFirstPlayer: boolean) => {

        const playerData: PlayerRoomDataConnected = {
            id,
            name,
            socket: socket.createPool()
        };

        const player: PlayerRoom = {
            id,
            name,
            isAdmin: isFirstPlayer,
            isLoading: false,
            isReady: false,
            characters: []
        };

        stateManager.setFn(({ playerDataList, playerList }) => ({
            playerDataList: [ ...playerDataList, playerData ],
            playerList: [ ...playerList, player ]
        }));

        initializePlayer(playerData);

        if (isFirstPlayer) {

            playerData.socket.send(
                { type: 'room/create' },
                {
                    type: 'room/player/set',
                    action: 'add',
                    player,
                    teamList: []
                }
            );
        } else {

            const { playerDataList } = stateManager.get();

            sendTo<RoomServerAction.PlayerSet>(
                playerDataList.filter(p => p.id !== id),
                {
                    type: 'room/player/set',
                    action: 'add',
                    player,
                    teamList: []
                }
            );

            const { mapSelected, playerList, teamList } = stateManager.clone('mapSelected', 'playerList', 'teamList');

            sendTo<RoomServerAction.RoomState>(
                [ playerData ],
                {
                    type: 'room/state',
                    mapSelected: mapSelected
                        ? {
                            id: mapSelected.config.id,
                            placementTileList: mapSelected.placementTileList
                        }
                        : null,
                    playerList,
                    teamList
                }
            );
        }
    };

    const sendTo = <A extends ServerAction>(
        playerDataList: readonly PlayerRoomDataConnected[],
        ...actionList: DistributiveOmit<A, 'sendTime'>[]
    ): void => {
        playerDataList.forEach(p => p.socket.send(...actionList));
    };

    const sendToEveryone = <A extends ServerAction>(
        ...actionList: DistributiveOmit<A, 'sendTime'>[]
    ): void => {
        const { playerDataList } = stateManager.get();
        sendTo(playerDataList, ...actionList);
    };

    const initializePlayer = (playerData: PlayerRoomDataConnected) => {
        const { id, socket } = playerData;

        const getPlayerRoom = () => stateManager.get().playerList
            .find(p => p.id === id)!;

        const deps: RoomListenerDependencies = {
            playerData,
            stateManager,
            sendToEveryone,
            dataManager,
            readFileMap,
            getPlayerRoom
        };

        socket.on<RoomClientAction.MapList>('room/map/list', getRoomMapList(deps));

        socket.on<RoomClientAction.MapSelect>('room/map/select', getRoomMapSelect(deps));

        socket.on<RoomClientAction.CharacterAdd>('room/character/add', getRoomCharacterAdd(deps));

        socket.on<RoomClientAction.CharacterRemove>('room/character/remove', getRoomCharacterRemove(deps));

        socket.on<RoomClientAction.PlayerState>('room/player/state', getRoomPlayerState(deps));

        socket.on<RoomClientAction.PlayerLeave>('room/player/leave', getRoomPlayerLeave(deps));
    };

    const { playerDataList } = stateManager.get();

    playerDataList.forEach(initializePlayer);

    // addNewPlayer(creatorData, true);

    return {
        onJoin: (playerData: PlayerRoomData) => {

            const { playerDataList } = stateManager.get();

            const isAdmin = !playerDataList.length;

            addNewPlayer(playerData, isAdmin);
        },

        isOpen: (): boolean => {

            const { mapSelected, playerList } = stateManager.get();

            if (!mapSelected) {
                return false;
            }

            const { nbrTeams, nbrCharactersPerTeam } = mapSelected.config;

            const nbrMaxPlayers = nbrTeams * nbrCharactersPerTeam;

            return playerList.length < nbrMaxPlayers;
        }
    };
};
