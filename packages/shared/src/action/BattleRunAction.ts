import { TAction } from "./TAction";
import { BattleSnapshot } from "../snapshot/BattleSnapshot";
import { Position } from "../snapshot/CharacterSnapshot";
import { GlobalTurnSnapshot } from "../snapshot/GlobalTurnSnapshot";
import { TurnSnapshot } from "../snapshot/TurnSnapshot";

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

export interface CharAction {
    spellId: string;
    positions: Position[];
}

export interface SpellActionSnapshot {
    startTime: number;
    duration: number;
    spellId: string;
    position: Position;
    battleHash: string;
    validated: boolean;
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
