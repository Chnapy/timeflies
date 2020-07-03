import { TAction } from '../TAction';
import { CharacterRole, PlayerRoom } from '../../entities';
import { Position } from '../../geo';

export type RoomClientAction =
    | RoomClientAction.Create
    | RoomClientAction.PlayerJoin
    | RoomClientAction.PlayerLeave
    | RoomClientAction.PlayerState
    | RoomClientAction.MapList
    | RoomClientAction.MapSelect
    | RoomClientAction.CharacterAdd
    | RoomClientAction.CharacterRemove;

export module RoomClientAction {

    export type Create = TAction<'room/create'>;

    export type PlayerJoin = TAction<'room/player/join'> & {
        roomId: string;
    };

    export type PlayerLeave = TAction<'room/player/leave'>;

    export type PlayerState = TAction<'room/player/state'>
        & Pick<PlayerRoom,
            | 'isLoading'
            | 'isReady'
        >;

    export type MapList = TAction<'room/map/list'>;

    export type MapSelect = TAction<'room/map/select'> & {
        mapId: string;
    };

    export type CharacterAdd = TAction<'room/character/add'> & {
        characterType: CharacterRole;
        position: Position;
    };

    export type CharacterRemove = TAction<'room/character/remove'> & {
        position: Position;
    };
}
