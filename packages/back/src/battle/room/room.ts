import { DeepReadonly, DistributiveOmit, MapConfig, PlayerRoom, RoomClientAction, RoomServerAction, ServerAction } from '@timeflies/shared';
import fs from 'fs';
import { TiledMap } from 'tiled-types';
import urlJoin from 'url-join';
import util from 'util';
import { staticURL } from '../../config';
import { WSSocket, WSSocketPool } from '../../transport/ws/WSSocket';
import { Util } from '../../Util';
import { getRoomCharacterAdd } from './room-character-add';
import { getRoomCharacterRemove } from './room-character-remove';
import { getRoomMapList } from './room-map-list';
import { getRoomMapSelect } from './room-map-select';
import { getRoomPlayerLeave } from './room-player-leave';
import { getRoomPlayerState } from './room-player-state';
import { RoomState, RoomStateManager } from './room-state-manager';
import { WSError } from '../../transport/ws/WSError';

type DataManager = {
    urlTransform: (url: string) => ({
        forServer: () => string;
        forClient: () => string;
    });
    getMapConfigList: () => MapConfig[];
};

type RoomListenerDependencies = {
    playerData: PlayerRoomDataConnected;
    sendToEveryone: WSSocket[ 'send' ];
    stateManager: RoomStateManager;
    dataManager: DataManager;
    readFileMap: (url: string) => Promise<TiledMap>;
    getPlayerRoom: () => DeepReadonly<PlayerRoom>;
    forbiddenError(reason: string): Error;
};

export type RoomListener<A extends RoomClientAction> = (deps: RoomListenerDependencies) => (action: A) => void | Promise<void>;

const readFile = util.promisify(fs.readFile);

const getMapConfigList = (): MapConfig[] => [
    {
        id: 'm1',
        name: 'Dungeon map',
        width: 20,
        height: 20,
        nbrTeams: 3,
        nbrCharactersPerTeam: 4,
        previewUrl: 'map/map_dungeon/map_dungeon_preview.png',
        schemaUrl: 'map/map_dungeon/map_dungeon.json'
    }
];

export type IPlayerRoomData<S> = {
    id: string;
    name: string;
    socket: S;
};

export type PlayerRoomData = IPlayerRoomData<WSSocket>;

export type PlayerRoomDataConnected = IPlayerRoomData<WSSocketPool>;

export type RoomDependencies = {
    initialState: Partial<RoomState>;
    dataManager: DataManager;
    readFileMap: (url: string) => Promise<TiledMap>;
};

export type Room = ReturnType<typeof Room>;

const getDataManager = (): DataManager => ({
    urlTransform: (url) => ({
        forServer: () => urlJoin('public', url),
        forClient: () => urlJoin(staticURL, url),
    }),
    getMapConfigList
});

export const Room = ({ initialState, dataManager, readFileMap }: RoomDependencies = {
    initialState: {},
    dataManager: getDataManager(),
    readFileMap: async url => {

        const schemaRaw = await readFile(url, 'utf8');

        return JSON.parse(schemaRaw);
    }
}) => {

    const stateManager = RoomStateManager(Util.getUnique(), initialState);

    const roomId = stateManager.get().id;

    const forbiddenError = (reason: string) => new WSError(403, reason);

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

        const { playerDataList } = stateManager.get();

        const { mapSelected, playerList, teamList } = stateManager.clone('mapSelected', 'playerList', 'teamList');

        sendTo<RoomServerAction.PlayerSet>(
            playerDataList.filter(p => p.id !== id),
            {
                type: 'room/player/set',
                action: 'add',
                player,
                teamList
            }
        );

        sendTo<RoomServerAction.RoomState>(
            [ playerData ],
            {
                type: 'room/state',
                roomId,
                mapSelected: mapSelected
                    ? {
                        config: {
                            ...mapSelected.config,
                            schemaUrl: dataManager.urlTransform(mapSelected.config.schemaUrl)
                                .forClient(),
                            previewUrl: dataManager.urlTransform(mapSelected.config.previewUrl)
                                .forClient()
                        },
                        placementTileList: mapSelected.placementTileList
                    }
                    : null,
                playerList,
                teamList
            }
        );
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
            getPlayerRoom,
            forbiddenError
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

            const { step, mapSelected, playerList } = stateManager.get();

            if (step !== 'idle') {
                return false;
            }

            if (!mapSelected) {
                return false;
            }

            const { nbrTeams, nbrCharactersPerTeam } = mapSelected.config;

            const nbrMaxPlayers = nbrTeams * nbrCharactersPerTeam;

            return playerList.length < nbrMaxPlayers;
        }
    };
};
