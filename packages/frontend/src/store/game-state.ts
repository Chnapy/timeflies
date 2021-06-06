import { PlayerCredentials } from '@timeflies/socket-messages';
import { BattleState } from '../battle-page/store/battle-state';

export type GameState = {
    credentials: PlayerCredentials | null;
    battle: BattleState | null;
};
