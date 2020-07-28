import { BattlePrepareClientAction, BattlePrepareServerAction } from "./BattlePrepareAction";
import { BattleRunCAction, BattleRunSAction } from "./BattleRunAction";
import { ErrorServerAction } from './error-server-action';
import { MatchmakerClientAction } from './MatchmakerAction';
import { RoomClientAction, RoomServerAction } from './room-action';
import { RoomListClientAction, RoomListServerAction } from './room-list-action';

export interface TAction<T extends string> {
    type: T;
    sendTime: number;
}

export type NarrowTAction<T, N extends string> = T extends TAction<N> ? T : never;

export interface SetIDCAction extends TAction<'set-id'> {
    id: string;
}

export type ServerAction =
    | ErrorServerAction
    | BattlePrepareServerAction
    | BattleRunSAction
    | RoomServerAction
    | RoomListServerAction
    ;

export type ClientAction =
    | SetIDCAction
    | MatchmakerClientAction
    | BattlePrepareClientAction
    | BattleRunCAction
    | RoomClientAction
    | RoomListClientAction
    ;
