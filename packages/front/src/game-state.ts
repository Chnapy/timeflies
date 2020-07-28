import { CurrentPlayer } from "./CurrentPlayer";
import { BattleState } from './ui/reducers/battle-reducers/battle-reducer';
import { RoomListState } from './ui/reducers/room-list-reducers/room-list-reducer';
import { RoomData } from './ui/reducers/room-reducers/room-reducer';


export type GameStateStep = 'boot' | keyof Pick<GameState, 'room' | 'roomList' | 'battle'>;

export interface GameState {

    currentPlayer: CurrentPlayer;

    step: GameStateStep;

    roomList: RoomListState;

    room: RoomData;

    battle: BattleState;

}
