import { Reducer } from 'redux';
import { GameStateStep } from '../../game-state';
import { GameAction } from '../../action/GameAction';

export const StepReducer: Reducer<GameStateStep, GameAction> = (state = 'boot', action) => {

    switch (action.type) {
        case 'load/launch':
            return 'load';
        case 'battle/launch':
            return 'battle';
        case 'room/join':
        case 'room/create':
            return 'room';
    }

    return state;
};
