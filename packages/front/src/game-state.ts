import { AuthState } from "./ui/reducers/auth-reducers/auth-reducer";
import { BattleState } from './ui/reducers/battle-reducers/battle-reducer';
import { RoomListState } from './ui/reducers/room-list-reducers/room-list-reducer';
import { RoomData } from './ui/reducers/room-reducers/room-reducer';


export type GameStateStep = keyof Pick<GameState, 'auth' | 'roomList' | 'room' | 'battle'>;

export interface GameState {

    step: GameStateStep;

    auth: AuthState;

    roomList: RoomListState;

    room: RoomData;

    battle: BattleState;

}
