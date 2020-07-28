import { TAction } from '../TAction';

export type RoomListServerAction =
    | RoomListServerAction.List
    ;

export type RoomOpenState = 'open' | 'in-battle' | 'no-map' | 'players-full';

export type RoomListItem = {
    id: string;
    adminName: string;
    mapName?: string;
    nbrPlayersMax?: number;
    nbrPlayersCurrent: number;
    roomState: RoomOpenState;
};

export module RoomListServerAction {

    export type List = TAction<'room-list/list'> & {
        list: RoomListItem[];
    };
}
