import { PlayerCredentials } from '@timeflies/socket-messages';
import { BattleState } from '../battle-page/store/battle-state';
import { ErrorListMap } from '../error-list/store/error-list-reducer';

export type GameState = {
    errorList: ErrorListMap;
    credentials: PlayerCredentials | null;
    battle: BattleState | null;
};
