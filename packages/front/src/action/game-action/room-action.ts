import { RoomCreateAction, RoomJoinAction } from '../../ui/reducers/room-reducers/room-reducer';

export type RoomAction =
    | RoomJoinAction
    | RoomCreateAction;
