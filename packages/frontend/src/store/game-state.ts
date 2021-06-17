import { PlayerCredentials } from '@timeflies/socket-messages';
import { BattleState } from '../battle-page/store/battle-state';
import { ErrorListMap } from '../error-list/store/error-list-reducer';
import { RoomState } from '../room-page/store/room-reducer';

export type GameState = {
    errorList: ErrorListMap;
    credentials: PlayerCredentials | null;
    room: RoomState | null;
    battle: BattleState | null;
};
