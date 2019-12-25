import { Reducer } from 'redux';
import { UIState } from '../UIState';
import { GameAction } from '../../action/GameAction';
import { combineReducers } from 'redux';
import { CharacterReducer } from './CharacterReducer';

export const RootReducer: Reducer<UIState, GameAction> = (state: any, action) => {
    console.log('ACTION', action);

    switch (action.type) {
        case 'battle/character/position':
            action.character.position = action.position;
            return {
                pathfinder: {} as any,
                ...state,
                currentCharacter: {
                    ...action.character
                }
            };
    }

    return combineReducers<UIState, GameAction>({
        pathfinder: () => ({} as any) as any,
        currentCharacter: CharacterReducer
    })(state, action);
};
