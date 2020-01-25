import { TAction } from "./TAction";
import { BattleSnapshot } from "../BattleSnapshot";
import { Position } from "../Character";
import { GlobalTurnSnapshot } from "../GlobalTurn";
import { TurnSnapshot } from "../Turn";

export interface BRunLaunchSAction extends TAction<'battle-run/launch'> {
    battleSnapshot: BattleSnapshot;
    globalTurnState: GlobalTurnSnapshot;
}

export interface BRunGlobalTurnStartSAction extends TAction<'battle-run/global-turn-start'> {
    globalTurnState: GlobalTurnSnapshot;
}

export interface BRunTurnStartSAction extends TAction<'battle-run/turn-start'> {
    turnState: TurnSnapshot;
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
