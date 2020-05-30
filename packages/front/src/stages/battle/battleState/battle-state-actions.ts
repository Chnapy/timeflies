import { createAction } from '@reduxjs/toolkit';
import { SpellType, TurnSnapshot } from '@timeflies/shared';
import { SpellAction } from '../spellAction/SpellActionManager';

export type BattleStateResetAction = ReturnType<typeof BattleStateResetAction>;
export const BattleStateResetAction = createAction<{
    characterId: string;
}>('battle/state/reset');

export type BattleStateTurnStartAction = ReturnType<typeof BattleStateTurnStartAction>;
export const BattleStateTurnStartAction = createAction<TurnSnapshot>('battle/state/turn-start');

export type BattleStateTurnEndAction = ReturnType<typeof BattleStateTurnEndAction>;
export const BattleStateTurnEndAction = createAction('battle/state/turn-end');

export type BattleStateSpellPrepareAction = ReturnType<typeof BattleStateSpellPrepareAction>;
export const BattleStateSpellPrepareAction = createAction<{
    spellType: SpellType;
}>('battle/state/spell-prepare');

export type BattleStateSpellLaunchAction = ReturnType<typeof BattleStateSpellLaunchAction>;
export const BattleStateSpellLaunchAction = createAction<{
    spellActions: SpellAction[];
}>('battle/state/spell-launch');

export type BattleStateAction = ReturnType<(typeof battleStateActionList)[ number ]>;
export const battleStateActionList = [
    BattleStateResetAction,
    BattleStateTurnStartAction,
    BattleStateTurnEndAction,
    BattleStateSpellPrepareAction,
    BattleStateSpellLaunchAction
] as const;
