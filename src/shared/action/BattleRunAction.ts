import { TAction } from "./TAction";
import { BattleSnapshot, GlobalTurnState, TurnState } from "../BattleSnapshot";
import { Position } from "../Character";

export interface BRunLaunchSAction extends TAction<'battle-run/launch'> {
    battleSnapshot: BattleSnapshot;
}

export interface BRunGlobalTurnStartSAction extends TAction<'battle-run/global-turn-start'> {
    globalTurnState: GlobalTurnState;
}

export interface BRunTurnStartSAction extends TAction<'battle-run/turn-start'> {
    turnState: TurnState;
}

export interface ConfirmSAction extends TAction<'confirm'> {
    isOk: boolean;
}

export interface NotifySAction extends TAction<'notify'> {
    charAction: CharActionCAction['charAction'];
    startTime: number;
}

export interface CharActionCAction extends TAction<'charAction'> {
    charAction: {
        spellId: string;
        positions: Position[];
    };
}

export type BattleRunSAction =
    | BRunLaunchSAction
    | BRunGlobalTurnStartSAction
    | BRunTurnStartSAction
    | ConfirmSAction
    | NotifySAction;

export type BattleRunCAction =
    | CharActionCAction;
