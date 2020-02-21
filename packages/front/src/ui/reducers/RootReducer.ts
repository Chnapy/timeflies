import { combineReducers, Reducer } from 'redux';
import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';
import { DataReducer } from './DataReducer';
import { CurrentPlayerReducer } from './CurrentPlayerReducer';

export const RootReducer: Reducer<UIState, GameAction> = (state, action) => {
    return combineReducers<UIState, GameAction>({
        currentPlayer: CurrentPlayerReducer,
        data: DataReducer
    })(state, action);
};
