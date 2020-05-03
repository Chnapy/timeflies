import { Reducer } from 'redux';
import { GameStateStep } from '../../game-state';
import { GameAction } from '../../action/game-action/GameAction';

export const StepReducer: Reducer<GameStateStep, GameAction> = (state = 'boot', action) => {

    switch (action.type) {
        case 'load/launch':
            return 'load';
        case 'battle/launch':
            return 'battle';
        case 'message/receive':
            if (action.message.type === 'room/state') {
                return 'room';
            }
            break;
    }

    return state;
};
