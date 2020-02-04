import { combineReducers, Reducer } from 'redux';
import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';
import { DataReducer } from './DataReducer';

export const RootReducer: Reducer<UIState, GameAction> = (state, action) => {
    return combineReducers<UIState, GameAction>({
        data: DataReducer
    })(state, action);
};
