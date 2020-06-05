import { createReducer } from '@reduxjs/toolkit';
import { GameStateStep } from '../../game-state';
import { BattleStartAction } from '../../stages/battle/battle-actions';
import { RoomStartAction } from './room-reducers/room-actions';

export const stepReducer = createReducer('boot' as GameStateStep, {
    [ RoomStartAction.type ]: () => 'room',
    [ BattleStartAction.type ]: () => 'battle'
});
