import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';

export const CharacterReducer = (state: UIState[ 'currentCharacter' ] | undefined, action: GameAction): UIState[ 'currentCharacter' ] => {

    switch (action.type) {
        case 'turn/start':
            return action.character;
        case 'turn/end':
            return null;
    }

    return state || null;
};
