import { TAction } from '../TAction';

export type RoomListClientAction =
    | RoomListClientAction.RequestList
    | RoomListClientAction.Join
    | RoomListClientAction.Create
    ;

export module RoomListClientAction {

    export type RequestList = TAction<'room-list/list/request'>;

    export type Join = TAction<'room-list/join'> & {
        roomId: string;
    };

    export type Create = TAction<'room-list/create'>;
}
