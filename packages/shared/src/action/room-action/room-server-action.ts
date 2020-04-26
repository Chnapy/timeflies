import { TAction } from '../TAction';
import { MapConfig } from '../../map';
import { TeamRoom } from '../../entities';

export type RoomServerAction =
    | RoomServerAction.RoomState;

export module RoomServerAction {

    export type RoomState = TAction<'room/state'> & {
        map: {
            mapList: MapConfig[];
            mapSelectedId: MapConfig[ 'id' ] | null;
        };
        teamsTree: TeamRoom[];
    };
}
