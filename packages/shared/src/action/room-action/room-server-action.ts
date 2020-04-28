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
    | RoomServerAction.PlayerRefresh;

export module RoomServerAction {

    export type RoomCreate = TAction<'room/create'>;

    export type PlayerSet = TAction<'room/player/set'> & {
        teams: TeamRoom[];
    } & ({
        action: 'add';
        player: PlayerRoom;
    } | {
        action: 'remove';
        playerId: string;
        reason: 'leave' | 'disconnect';
    });

    export type CharacterSet = TAction<'room/character/set'> & {
        playerId: string;
        teams: TeamRoom[];
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
            placementTiles: {
                teamId: string;
                position: Position;
            }[];
        } | null;
        teams: TeamRoom[];
    };

    export type PlayerRefresh = TAction<'room/player/refresh'> & {
        player: Omit<PlayerRoom, 'characters'>;
    };
}
