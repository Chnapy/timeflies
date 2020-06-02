import { CurrentPlayer } from "./CurrentPlayer";
import { BattleState } from './ui/reducers/battle-reducers/battle-reducer';
import { RoomData } from './ui/reducers/room-reducers/room-reducer';


export type GameStateStep = 'boot' | keyof Pick<GameState, 'room' | 'battle'>;

export interface GameState {

    currentPlayer: CurrentPlayer | null;

    step: GameStateStep;

    room: RoomData | null;

    battle: BattleState;

}
