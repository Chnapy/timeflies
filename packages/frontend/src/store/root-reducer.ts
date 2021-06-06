import { combineReducers } from '@reduxjs/toolkit';
import { battleReducer } from '../battle-page/store/battle-reducer';
import { credentialsReducer } from '../login-page/store/credentials-reducer';
import { GameState } from './game-state';

export const rootReducer = combineReducers<GameState>({
    credentials: credentialsReducer,
    battle: battleReducer
});
