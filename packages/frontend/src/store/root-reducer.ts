import { combineReducers } from '@reduxjs/toolkit';
import { battleReducer } from '../battle-page/store/battle-reducer';
import { errorListReducer } from '../error-list/store/error-list-reducer';
import { credentialsReducer } from '../login-page/store/credentials-reducer';
import { GameState } from './game-state';

export const rootReducer = combineReducers<GameState>({
    errorList: errorListReducer,
    credentials: credentialsReducer,
    battle: battleReducer
});
