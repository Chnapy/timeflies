import { BattleSnapshot } from "../battleStage/BattleSnapshot";
import { GlobalTurnSnapshot } from "../cycle/GlobalTurn";
import { TurnSnapshot } from "../cycle/Turn";
import { SpellActionSnapshot } from '../entities/Spell';
import { TAction } from "./TAction";

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
    lastCorrectHash: string;
}

export interface NotifySAction extends TAction<'notify'> {
    spellActionSnapshot: SpellActionSnapshot;
}

export interface SpellActionCAction extends TAction<'battle/spellAction'> {
    spellAction: SpellActionSnapshot;
}

export type BattleRunSAction =
    | BRunLaunchSAction
    | BRunGlobalTurnStartSAction
    | BRunTurnStartSAction
    | ConfirmSAction
    | NotifySAction;

export type BattleRunCAction =
    | SpellActionCAction;
