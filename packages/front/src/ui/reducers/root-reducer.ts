import { combineReducers, Reducer } from 'redux';
import { GameAction } from '../../action/game-action/GameAction';
import { GameState } from '../../game-state';
import { BattleReducer } from './battle-reducers/battle-reducer';
import { CurrentPlayerReducer } from './current-player-reducer';
import { LoadReducer } from './load-reducers/load-reducer';
import { RoomReducer } from './room-reducers/room-reducer';
import { StepReducer } from './step-reducer';

export const RootReducer: Reducer<GameState, GameAction> = (state, action) => {
    
    return combineReducers<GameState>({
        currentPlayer: CurrentPlayerReducer,
        step: StepReducer,
        load: LoadReducer,
        room: RoomReducer,
        battle: BattleReducer,
    })(state, action);
};
