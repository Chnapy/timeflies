import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';

export const CharacterReducer = (state: UIState[ 'currentCharacter' ] | undefined, action: GameAction): UIState[ 'currentCharacter' ] => {

    switch (action.type) {
        case 'battle/turn/start':
            return action.character;
        case 'battle/turn/end':
            return null;
    }

    return state || null;
};
