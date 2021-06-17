import { createAction } from '@reduxjs/toolkit';
import { BattleLoadData } from '@timeflies/socket-messages';

export type BattleLoadAction = ReturnType<typeof BattleLoadAction>;
export const BattleLoadAction = createAction<BattleLoadData>('battle/load');

export type BattleResetAction = ReturnType<typeof BattleResetAction>;
export const BattleResetAction = createAction('battle/reset');
