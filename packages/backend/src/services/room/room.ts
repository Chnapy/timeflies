import { CharacterId, PlayerId, Position } from '@timeflies/common';
import { MapInfos, RoomStateData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import fs from 'fs';
import type TiledMap from 'tiled-types';
import util from 'util';
import { GlobalEntities } from '../../main/global-entities';
import { assetUrl } from '../../utils/asset-url';

const readFile = util.promisify(fs.readFile);

export type RoomId = string;

export type Room = {
    roomId: RoomId;

    getRoomStateData: () => RoomStateData;
    getMapPlacementTiles: () => { [ teamColor: string ]: Position[] };

    playerJoin: (playerInfos: RoomStaticPlayer) => void;
    playerReady: (playerId: PlayerId, ready: boolean) => void;
    playerLeave: (playerId: PlayerId) => void;
    teamJoin: (playerId: PlayerId, teamColor: string) => void;
    characterSelect: (staticCharacter: RoomStaticCharacter) => void;
    characterRemove: (characterId: CharacterId) => void;
    characterPlacement: (characterId: CharacterId, position: Position | null) => void;
    mapSelect: (mapInfos: MapInfos) => Promise<void>;
    // playerLeave: (playerId: PlayerId) => void;
};

const allTeamColorList = [ '#3BA92A', '#FFD74A', '#A93B2A', '#3BA9A9' ];

export const createRoom = ({ services }: GlobalEntities): Room => {
    const roomId = 'roomId';
    // TODO createId();

    let mapInfos: MapInfos | null = null;
    let tiledMap: TiledMap | null = null;
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

    // TODO
    const getMapPlacementTiles = (): { [ teamColor: string ]: Position[] } => {
        return {};
    };

    return {
        roomId,

        getRoomStateData,
        getMapPlacementTiles,

        playerJoin: playerInfos => {
            staticPlayerList.push(playerInfos);
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

            const tiledMapRaw = await readFile(assetUrl.toBackend(mapInfos.schemaLink), 'utf-8');
            tiledMap = JSON.parse(tiledMapRaw);
        }
    };
};
