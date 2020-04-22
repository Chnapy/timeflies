import { useSelector } from 'react-redux';
import { GameState } from '../../game-state';

export const useGameSelector = <R>(fn: (state: GameState) => R) => useSelector<GameState, R>(fn);
