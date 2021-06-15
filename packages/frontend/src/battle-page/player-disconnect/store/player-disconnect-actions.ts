import { createAction } from '@reduxjs/toolkit';
import { SerializableState } from '@timeflies/common';
import { BattlePlayerDisconnectMessageData } from '@timeflies/socket-messages';

export type BattlePlayerDisconnectAction = ReturnType<typeof BattlePlayerDisconnectAction>;
export const BattlePlayerDisconnectAction = createAction<BattlePlayerDisconnectMessageData>('battle/player-disconnect');

export type BattlePlayerDisconnectRemoveAction = ReturnType<typeof BattlePlayerDisconnectRemoveAction>;
export const BattlePlayerDisconnectRemoveAction = createAction<{ newState: SerializableState }>('battle/player-disconnect/remove');
