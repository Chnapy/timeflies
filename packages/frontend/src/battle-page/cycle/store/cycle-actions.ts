import { createAction } from '@reduxjs/toolkit';
import { BattleTurnStartData } from '@timeflies/socket-messages';

export type BattlePrepareTurnStartAction = ReturnType<typeof BattlePrepareTurnStartAction>;
export const BattlePrepareTurnStartAction = createAction<BattleTurnStartData>('cycle/prepare-turn-start');
