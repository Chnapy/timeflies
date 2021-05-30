import { CharacterId, ObjectTyped, PlayerId, Position } from '@timeflies/common';
import { MapInfos, RoomStateData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import { Layer, Tile } from '@timeflies/tilemap-utils';
import fs from 'fs';
import type TiledMap from 'tiled-types';
import util from 'util';
import { assetUrl } from '../../utils/asset-url';

export type RoomId = string;

type MapPlacementTiles = { [ teamColor: string ]: Position[] };

export type Room = {
    roomId: RoomId;

    getRoomStateData: () => RoomStateData;
    getMapPlacementTiles: () => Promise<MapPlacementTiles>;

    playerJoin: (playerInfos: RoomStaticPlayer) => void;
    playerReady: (playerId: PlayerId, ready: boolean) => void;
    playerLeave: (playerId: PlayerId) => void;
    teamJoin: (playerId: PlayerId, teamColor: string) => void;
    characterSelect: (staticCharacter: RoomStaticCharacter) => void;
    characterRemove: (characterId: CharacterId) => void;
    characterPlacement: (characterId: CharacterId, position: Position | null) => void;
    mapSelect: (mapInfos: MapInfos) => void;
    computeMapPlacementTiles: () => void;
};

const allTeamColorList = [ '#3BA92A', '#FFD74A', '#A93B2A', '#3BA9A9' ];

export const createRoom = (): Room => {
    const roomId = 'roomId';
    // TODO createId();

    let mapInfos: MapInfos | null = null;
    let tiledMapPromise: Promise<TiledMap> | null = null;
    let playerAdminId: PlayerId = '';
    const staticPlayerList: RoomStaticPlayer[] = [];
    let staticCharacterList: RoomStaticCharacter[] = [];

    const getTeamColorList = () => mapInfos
        ? allTeamColorList.slice(0, mapInfos.nbrTeams)
        : [];

    const getRoomStateData = (): RoomStateData => ({
        roomId,
        mapInfos,
        playerAdminId,
        teamColorList: getTeamColorList(),
        staticPlayerList,
        staticCharacterList
    });

    return {
        roomId,

        getRoomStateData,
        getMapPlacementTiles: async () => {
            const tiledMap = await tiledMapPromise!;

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
        },

        playerJoin: playerInfos => {
            staticPlayerList.push(playerInfos);

            if (staticPlayerList.length === 1) {
                playerAdminId = playerInfos.playerId;
            }
        },
        playerReady: (playerId, ready) => {
            const player = staticPlayerList.find(p => p.playerId === playerId);
            player!.ready = ready;
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
        mapSelect: (selectedMapInfos) => {
            mapInfos = selectedMapInfos;
        },
        computeMapPlacementTiles: () => {
            const readFile = util.promisify(fs.readFile);

            tiledMapPromise = readFile(assetUrl.toBackend(mapInfos!.schemaLink), 'utf-8')
                .then<TiledMap>(JSON.parse);
        }
    };
};
