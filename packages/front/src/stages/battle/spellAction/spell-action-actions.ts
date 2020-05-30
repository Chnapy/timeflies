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

export type SpellActionCancelAction = ReturnType<typeof SpellActionCancelAction>;
export const SpellActionCancelAction = createAction<{
    spellActionSnapshotsValids: SpellActionSnapshot[];
}>('battle/spell-action/cancel');

export type SpellActionLaunchAction = ReturnType<typeof SpellActionLaunchAction>;
export const SpellActionLaunchAction = createAction<{
    spellActionSnapshotList: SpellActionSnapshot[];
}>('battle/spell-action/launch');
