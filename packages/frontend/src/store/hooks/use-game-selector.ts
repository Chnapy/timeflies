import { useSelector } from 'react-redux';
import { GameState } from '../game-state';

export const useGameSelector = function <R>(selector: (state: GameState) => R) {
    return useSelector<GameState, R>(selector);
};
