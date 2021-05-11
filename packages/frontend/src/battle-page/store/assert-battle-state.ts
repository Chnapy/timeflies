import { GameState } from '../../store/game-state';
import { BattleState } from './battle-state';

export function assertBattleState(battleState: GameState[ 'battle' ]): asserts battleState is BattleState {
    if (battleState === null) {
        throw new Error('battleState not defined');
    }
};
