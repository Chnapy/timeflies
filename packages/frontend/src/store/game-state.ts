import { BattleState } from '../battle-page/store/battle-state';

export type GameState = {
    battle: BattleState | null;
};
