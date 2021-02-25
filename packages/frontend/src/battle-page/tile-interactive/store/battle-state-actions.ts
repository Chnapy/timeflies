import { createAction } from '@reduxjs/toolkit';
import { SerializableState, SpellAction } from '@timeflies/common';

export type BattleTimeUpdateAction = ReturnType<typeof BattleTimeUpdateAction>;
export const BattleTimeUpdateAction = createAction<{
    currentTime: number;
}>('battle/time-update');

export type BattleCommitAction = ReturnType<typeof BattleCommitAction>;
export const BattleCommitAction = createAction<{
    spellAction: SpellAction;
    futureState: SerializableState;
    // spellEffect: SpellEffect;    // for feedback component
}>('battle/commit');

export type BattleRollbackAction = ReturnType<typeof BattleRollbackAction>;
export const BattleRollbackAction = createAction<{
    lastState: SerializableState;
}>('battle/rollback');
