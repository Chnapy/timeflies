import { Reducer } from 'redux';
import { UIState } from '../UIState';
import { GameAction } from '../../action/GameAction';
import { combineReducers } from 'redux';
import { CharacterReducer } from './CharacterReducer';
import { GameStateReducer } from './GameStateReducer';

export const RootReducer: Reducer<UIState, GameAction> = (state: any, action) => {
    console.log('ACTION', action);

    return combineReducers<UIState, GameAction>({
        gameState: GameStateReducer,
        currentCharacter: CharacterReducer
    })(state, action);
};
