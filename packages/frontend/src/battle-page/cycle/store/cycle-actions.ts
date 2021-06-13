import { createAction } from '@reduxjs/toolkit';
import { PlayerId } from '@timeflies/common';
import { BattleTurnStartData } from '@timeflies/socket-messages';

export type BattlePrepareTurnStartAction = ReturnType<typeof BattlePrepareTurnStartAction>;
export const BattlePrepareTurnStartAction = createAction<BattleTurnStartData & {
    myPlayerId: PlayerId;
}>('cycle/prepare-turn-start');

export type BattleTurnEndAction = ReturnType<typeof BattleTurnEndAction>;
export const BattleTurnEndAction = createAction('cycle/turn-end');
