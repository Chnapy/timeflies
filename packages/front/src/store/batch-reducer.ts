import { Reducer } from '@reduxjs/toolkit';
import { GameState } from '../game-state';
import { BatchActions } from './batch-middleware';

export const batchReducer = (reducer: Reducer<GameState>): Reducer<GameState> => {

    return (state, action) => {
        if (BatchActions.match(action)) {

            // should not dispatch without child actions
            if(!action.payload.length) {
                throw new Error();
            }

            return action.payload.reduce((state, action) => {

                return reducer(state, action);
            }, state!);
        }

        return reducer(state, action);
    };
};
