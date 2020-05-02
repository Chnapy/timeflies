import { CharacterRoom, PlayerRoom, TeamRoom } from '../../entities';
import { Position } from '../../geo';
import { MapConfig } from '../../map';
import { TAction } from '../TAction';

export type RoomServerAction =
    | RoomServerAction.RoomCreate
    | RoomServerAction.PlayerSet
    | RoomServerAction.CharacterSet
    | RoomServerAction.MapList
    | RoomServerAction.MapSelect
    | RoomServerAction.PlayerRefresh
    | RoomServerAction.RoomState;

export type MapPlacementTile = {
    teamId: string;
    position: Position;
};

export module RoomServerAction {

    export type RoomCreate = TAction<'room/create'>;

    export type PlayerSet = TAction<'room/player/set'> & {
        teamList: TeamRoom[];
    } & ({
        action: 'add';
        player: PlayerRoom;
    } | {
        action: 'remove';
        playerId: string;
        reason: 'leave' | 'disconnect';
        playerList: PlayerRoom[];
    });

    export type CharacterSet = TAction<'room/character/set'> & {
        playerId: string;
        teamList: TeamRoom[];
    } & ({
        action: 'add';
        character: CharacterRoom;
    } | {
        action: 'remove';
        characterId: string;
    });

    export type MapList = TAction<'room/map/list'> & {
        mapList: MapConfig[];
    };

    export type MapSelect = TAction<'room/map/select'> & {
        mapSelected: {
            id: MapConfig[ 'id' ];
            placementTileList: MapPlacementTile[];
        } | null;
        teamList: TeamRoom[];
        playerList: PlayerRoom[];
    };

    export type PlayerRefresh = TAction<'room/player/refresh'> & {
        player: Pick<PlayerRoom,
            | 'id'
            | 'isAdmin'
            | 'isLoading'
            | 'isReady'
        >;
    };

    export type RoomState = TAction<'room/state'> &
        Omit<MapSelect, 'type'>;
}