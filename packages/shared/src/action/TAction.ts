import { BattlePrepareClientAction, BattlePrepareServerAction } from "./BattlePrepareAction";
import { BattleRunCAction, BattleRunSAction } from "./BattleRunAction";
import { MatchmakerClientAction } from './MatchmakerAction';

export interface TAction<T extends string> {
    type: T;
    sendTime: number;
}

export type NarrowTAction<T, N extends string> = T extends TAction<N> ? T : never;

export interface SetIDCAction extends TAction<'set-id'> {
    id: string;
}

export type ServerAction =
    | BattlePrepareServerAction
    | BattleRunSAction;

export type ClientAction =
    | SetIDCAction
    | MatchmakerClientAction
    | BattlePrepareClientAction
    | BattleRunCAction;
