import { BattleLoadPayload } from '@timeflies/shared';
import { BattleDataMap } from "./BattleData";
import { CurrentPlayer } from "./CurrentPlayer";
import { RoomData } from './ui/reducers/room-reducers/room-reducer';


export type GameStateStep = 'boot' | keyof Pick<GameState, 'room' | 'load' | 'battle'>;

export interface GameState {

    currentPlayer: CurrentPlayer | null;

    step: GameStateStep;

    load: BattleLoadPayload | null;

    room: RoomData | null;

    battle: BattleDataMap | null;

}
