import { createAction } from '@reduxjs/toolkit';
import { SerializableState, SpellAction } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';

export type BattleTimeUpdateAction = ReturnType<typeof BattleTimeUpdateAction>;
export const BattleTimeUpdateAction = createAction<{
    currentTime: number;
}>('battle/state/time-update');

export type BattleCommitAction = ReturnType<typeof BattleCommitAction>;
export const BattleCommitAction = createAction<{
    spellAction: SpellAction;
    futureState: SerializableState;
    spellEffect: SpellEffect;
}>('battle/state/commit');

export type BattleRollbackAction = ReturnType<typeof BattleRollbackAction>;
export const BattleRollbackAction = createAction<{
    lastState: SerializableState;
}>('battle/state/rollback');
