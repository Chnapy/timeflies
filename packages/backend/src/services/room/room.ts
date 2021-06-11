import { CharacterId, createId, ObjectTyped, PlayerId, Position, WaitCancelableState, waitCanceleable } from '@timeflies/common';
import { MapInfos, MapPlacementTiles, RoomStateData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import { Layer, Tile } from '@timeflies/tilemap-utils';
import fs from 'fs';
import type TiledMap from 'tiled-types';
import util from 'util';
import { GlobalEntities } from '../../main/global-entities';
import { assetUrl } from '../../utils/asset-url';
import { Battle, createBattle } from '../battle/battle';

export type RoomId = string;

export type Room = {
    roomId: RoomId;

    getRoomStateData: () => RoomStateData;

    playerJoin: (playerInfos: RoomStaticPlayer) => void;
    playerReady: (playerId: PlayerId, ready: boolean) => void;
    playerLeave: (playerId: PlayerId) => void;
    teamJoin: (playerId: PlayerId, teamColor: string) => void;
    characterSelect: (staticCharacter: RoomStaticCharacter) => void;
    characterRemove: (characterId: CharacterId) => void;
    characterPlacement: (characterId: CharacterId, position: Position | null) => void;
    mapSelect: (mapInfos: MapInfos) => Promise<void>;
    waitForBattle: () => Promise<WaitCancelableState[ 'state' ]>;
    createBattle: () => Promise<Battle>;
    removeBattle: () => void;
    isInBattle: () => boolean;
};

const allTeamColorList = [ '#3BA92A', '#FFD74A', '#A93B2A', '#3BA9A9' ];

export const createRoom = (globalEntities: GlobalEntities): Room => {
    const roomId = createId();

    let mapInfos: MapInfos | null = null;
    let tiledMapPromise: Promise<TiledMap> | null = null;
    let placementTiles: MapPlacementTiles = {};
    let playerAdminId: PlayerId = '';
    const staticPlayerList: RoomStaticPlayer[] = [];
    let staticCharacterList: RoomStaticCharacter[] = [];

    let battle: Battle | null = null;
    let battlePromiseCancel = () => { };

    const getTeamColorList = () => mapInfos
        ? allTeamColorList.slice(0, mapInfos.nbrTeams)
        : [];

    const getMapInfosFrontend = () => {
        if (!mapInfos) {
            return null;
        }

        return globalEntities.services.mapRoomService.getMapInfosFrontend(mapInfos);
    };

    const getMapPlacementTiles = async (tiledMap: TiledMap): Promise<MapPlacementTiles> => {

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

                acc[ allTeamColorList[ index ] ] = positionList;

                return acc;
            }, {});
    };

    const computeMapPlacementTiles = () => {
        const readFile = util.promisify(fs.readFile);

        tiledMapPromise = readFile(assetUrl.toBackend(mapInfos!.schemaLink), 'utf-8')
            .then<TiledMap>(JSON.parse)
            .then<TiledMap>(async (tiledMap) => {
                placementTiles = await getMapPlacementTiles(tiledMap);

                return tiledMap;
            });
        return tiledMapPromise;
    };

    const getRoomStateData = (): RoomStateData => ({
        roomId,
        mapInfos: getMapInfosFrontend(),
        mapPlacementTiles: placementTiles,
        playerAdminId,
        teamColorList: getTeamColorList(),
        staticPlayerList,
        staticCharacterList
    });

    return {
        roomId,

        getRoomStateData,

        playerJoin: playerInfos => {
            staticPlayerList.push(playerInfos);

            if (staticPlayerList.length === 1) {
                playerAdminId = playerInfos.playerId;
            }

            battlePromiseCancel();
        },
        playerReady: (playerId, ready) => {
            const player = staticPlayerList.find(p => p.playerId === playerId);
            player!.ready = ready;

            if (!ready) {
                battlePromiseCancel();
            }
        },
        playerLeave: playerId => {
            staticPlayerList.splice(
                staticPlayerList.findIndex(c => c.playerId === playerId),
                1
            );
            staticCharacterList = staticCharacterList.filter(character => character.playerId !== playerId);

            if (playerId === playerAdminId) {
                playerAdminId = staticPlayerList.length
                    ? staticPlayerList[ 0 ].playerId
                    : '';
            }

            battlePromiseCancel();
        },
        teamJoin: (playerId, teamColor) => {
            const player = staticPlayerList.find(p => p.playerId === playerId);
            player!.teamColor = teamColor;
        },
        characterSelect: staticCharacter => {
            staticCharacterList.push(staticCharacter);
        },
        characterRemove: characterId => {
            staticCharacterList.splice(
                staticCharacterList.findIndex(c => c.characterId === characterId),
                1
            );
        },
        characterPlacement: (characterId, position) => {
            const character = staticCharacterList.find(char => char.characterId === characterId);
            character!.placement = position;
        },
        mapSelect: async (selectedMapInfos) => {
            mapInfos = selectedMapInfos;
            await computeMapPlacementTiles();
        },
        waitForBattle: async () => {
            const { promise, cancel } = waitCanceleable(5000);

            battlePromiseCancel = cancel;

            const { state } = await promise;
            return state;
        },
        createBattle: async () => {
            const tiledMap = await tiledMapPromise!;

            const entityLists = globalEntities.services.entityListGetRoomService.getEntityLists();

            battle = createBattle(
                globalEntities,
                getRoomStateData(),
                entityLists,
                tiledMap,
                () => globalEntities.services.playerRoomService.onBattleEnd(roomId, battle!.battleId)
            );

            return battle!;
        },
        removeBattle: () => {
            battle = null;
        },
        isInBattle: () => battle !== null
    };
};
