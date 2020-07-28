import { combineReducers } from 'redux';
import { GameState } from '../../game-state';
import { battleReducer } from './battle-reducers/battle-reducer';
import { currentPlayerReducer } from './current-player-reducer';
import { roomListReducer } from './room-list-reducers/room-list-reducer';
import { RoomReducer } from './room-reducers/room-reducer';
import { stepReducer } from './step-reducer';

export const rootReducer = combineReducers<GameState>({
    currentPlayer: currentPlayerReducer,
    step: stepReducer,
    roomList: roomListReducer,
    room: RoomReducer,
    battle: battleReducer,
});
