import { GameState } from '../../game-state';
import { serviceSelector } from '../../services/serviceSelector';

export const useGameSelector = <R>(fn: (state: GameState) => R) => serviceSelector(fn);
