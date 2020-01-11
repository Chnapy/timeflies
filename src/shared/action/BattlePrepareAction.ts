import { TAction } from "./TAction";
import { BattleLoadPayload } from "../BattleLoadPayload";

export interface BattleLoadSAction extends TAction<'battle-load'> {
    payload: BattleLoadPayload;
}

export type BattlePrepareServerAction =
    | BattleLoadSAction;

export interface BattleLoadEndedCAction extends TAction<'battle-load-end'> {
}

export type BattlePrepareClientAction =
    | BattleLoadEndedCAction;
    