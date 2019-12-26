import { UIState } from '../UIState';
import { GameAction } from '../../action/GameAction';

export const GameStateReducer = (state: UIState[ 'gameState' ] | undefined, action: GameAction): UIState[ 'gameState' ] => {

    switch (action.type) {
        case 'battle/state':
            return action.stateObject;
    }

    return state || {
        state: 'watch'
    };
};
