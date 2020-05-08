import { BattleDataMap } from "./BattleData";
import { CurrentPlayer } from "./CurrentPlayer";
import { RoomData } from './ui/reducers/room-reducers/room-reducer';


export type GameStateStep = 'boot' | keyof Pick<GameState, 'room' | 'battle'>;

export interface GameState {

    currentPlayer: CurrentPlayer | null;

    step: GameStateStep;

    room: RoomData | null;

    battle: BattleDataMap | null;

}
