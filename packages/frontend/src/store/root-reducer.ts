import { combineReducers } from '@reduxjs/toolkit';
import { battleReducer } from '../battle-page/store/battle-reducer';
import { GameState } from './game-state';

export const rootReducer = combineReducers<GameState>({
    battle: battleReducer
});
