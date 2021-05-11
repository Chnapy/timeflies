import { useGameSelector } from '../../../store/hooks/use-game-selector';
import { BattleState } from '../battle-state';

export const useBattleSelector = function <R>(selector: (state: BattleState) => R) {
    return useGameSelector(state => {
        if (!state.battle) {
            throw new Error('no battle state');
        }
        return selector(state.battle);
    });
};
