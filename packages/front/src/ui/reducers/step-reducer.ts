import { Reducer } from 'redux';
import { GameStateStep } from '../../game-state';
import { GameAction } from '../../action/game-action/GameAction';

export const StepReducer: Reducer<GameStateStep, GameAction> = (state = 'boot', action) => {

    switch (action.type) {
        case 'stage/change':
            return action.payload.stageKey;
    }

    return state;
};
