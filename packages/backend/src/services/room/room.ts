import { createId, PlayerId } from '@timeflies/common';
import { MapInfos, MapPlacementTiles, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import type TiledMap from 'tiled-types';
import { Battle } from '../battle/battle';

export type RoomId = string;

export type Room = {
    roomId: RoomId;

    playerAdminId: PlayerId;
    staticPlayerList: RoomStaticPlayer[];
    staticCharacterList: RoomStaticCharacter[];
    teamColorList: string[];

    mapInfos: MapInfos | null;
    tiledMap: TiledMap | null;
    mapPlacementTiles: MapPlacementTiles;

    battle: Battle | null;
    cancelBattleLaunch: () => void;
};

export const createRoom = (): Room => ({
    roomId: createId('short'),

    playerAdminId: '',
    staticPlayerList: [],
    staticCharacterList: [],
    teamColorList: [],

    mapInfos: null,
    tiledMap: null,
    mapPlacementTiles: {},

    battle: null,
    cancelBattleLaunch: () => { }
});
