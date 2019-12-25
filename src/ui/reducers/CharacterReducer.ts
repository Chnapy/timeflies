import { GameAction } from '../../action/GameAction';
import { UIState } from '../UIState';

export const CharacterReducer = (state: UIState[ 'currentCharacter' ] | undefined, action: GameAction): UIState[ 'currentCharacter' ] => {

    switch (action.type) {
        case 'turn/start':
            return action.character;
        // case 'battle/character/position':
        //     return {
        //         ...action.character,
        //         position: action.position
        //     };
        case 'turn/end':
            return null;
    }

    return state || null;
};
