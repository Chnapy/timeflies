import { createAction } from '@reduxjs/toolkit';
import { Position } from '@timeflies/shared';

export type BattleCommitAction = ReturnType<typeof BattleCommitAction>;
export const BattleCommitAction = createAction<{
    time: number;
    charactersPositionList: Position[];
}>('battle/commit');
