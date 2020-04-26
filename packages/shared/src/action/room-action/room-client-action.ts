import { TAction } from '../TAction';
import { CharacterType } from '../../entities';
import { Position } from '../../geo';

export type RoomClientAction =
    | RoomClientAction.Create
    | RoomClientAction.Join
    | RoomClientAction.MapSelect
    | RoomClientAction.CharacterAdd
    | RoomClientAction.CharacterRemove
    | RoomClientAction.Ready;

export module RoomClientAction {

    export type Create = TAction<'room/create'>;

    export type Join = TAction<'room/join'> & {
        roomId: string;
    };

    export interface MapSelect extends TAction<'room/map/select'> {
        mapId: string;
    }

    export type CharacterAdd = TAction<'room/character/add'> & {
        characterType: CharacterType;
        position: Position;
    };

    export type CharacterRemove = TAction<'room/character/remove'> & {
        position: Position;
    };

    export type Ready = TAction<'room/ready'>;
}
