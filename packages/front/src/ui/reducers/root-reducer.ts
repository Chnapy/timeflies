import { combineReducers } from 'redux';
import { GameState } from '../../game-state';
import { battleReducer } from './battle-reducers/battle-reducer';
import { roomListReducer } from './room-list-reducers/room-list-reducer';
import { RoomReducer } from './room-reducers/room-reducer';
import { stepReducer } from './step-reducer';
import { authReducer } from './auth-reducers/auth-reducer';

export const rootReducer = combineReducers<GameState>({
    step: stepReducer,
    auth: authReducer,
    roomList: roomListReducer,
    room: RoomReducer,
    battle: battleReducer,
});
