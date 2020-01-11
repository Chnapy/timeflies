import { BattlePrepareClientAction, BattlePrepareServerAction } from "./BattlePrepareAction";
import { BattleRunCAction, BattleRunSAction } from "./BattleRunAction";

export interface TAction<T extends string> {
    type: T;
    sendTime: number;
}

export interface SetIDCAction extends TAction<'set-id'> {
    id: string;
}

export type ServerAction =
    | BattlePrepareServerAction
    | BattleRunSAction;

export type ClientAction =
    | SetIDCAction
    | BattlePrepareClientAction
    | BattleRunCAction;
