import { combineReducers, Reducer } from 'redux';
import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';
import { CharacterReducer } from './CharacterReducer';

export const RootReducer: Reducer<UIState, GameAction> = (state: any, action) => {
    return combineReducers<UIState, GameAction>({
        currentCharacter: CharacterReducer
    })(state, action);
};
