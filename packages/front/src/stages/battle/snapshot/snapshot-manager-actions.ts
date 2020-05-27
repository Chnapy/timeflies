import { createAction } from '@reduxjs/toolkit';

export type BattleCommitAction = ReturnType<typeof BattleCommitAction>;
export const BattleCommitAction = createAction<{
    time: number;
}>('battle/commit');
