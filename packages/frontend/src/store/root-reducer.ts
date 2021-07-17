import { combineReducers } from '@reduxjs/toolkit';
import { enableBatching } from 'redux-batched-actions';
import { battleReducer } from '../battle-page/store/battle-reducer';
import { errorListReducer } from '../error-list/store/error-list-reducer';
import { credentialsReducer } from '../login-page/store/credentials-reducer';
import { roomReducer } from '../room-page/store/room-reducer';
import { GameState } from './game-state';

export const rootReducer = enableBatching(
    combineReducers<GameState>({
        errorList: errorListReducer,
        credentials: credentialsReducer,
        room: roomReducer,
        battle: battleReducer
    })
);
