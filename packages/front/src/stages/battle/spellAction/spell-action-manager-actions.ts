import { createAction } from '@reduxjs/toolkit';
import { SpellActionSnapshot } from '@timeflies/shared';

export type SpellActionTimerStartAction = ReturnType<typeof SpellActionTimerStartAction>;
export const SpellActionTimerStartAction = createAction<{
    spellActionSnapshot: SpellActionSnapshot;
}>('battle/spell-action/start');

export type SpellActionTimerEndAction = ReturnType<typeof SpellActionTimerEndAction>;
export const SpellActionTimerEndAction = createAction<{
    spellActionSnapshot: SpellActionSnapshot;
    removed: boolean;
    correctHash: string;    // may be not the same as the snapshot one
}>('battle/spell-action/end');
