import { GameState } from '../../game-state';
import { useSelector } from 'react-redux';

export const useGameSelector = <R>(fn: (state: GameState) => R, equalityFn?: (left: R, right: R) => boolean) => useSelector(fn, equalityFn);
