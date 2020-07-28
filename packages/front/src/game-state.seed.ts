import { GameState } from './game-state';
import { battleReducer } from './ui/reducers/battle-reducers/battle-reducer';
import { RoomReducer } from './ui/reducers/room-reducers/room-reducer';
import { roomListReducer } from './ui/reducers/room-list-reducers/room-list-reducer';

export const seedGameState = (playerId: string, initialState: Partial<GameState>): GameState => ({
    currentPlayer: {
        id: playerId,
        name: playerId
    },
    step: 'boot',
    roomList: roomListReducer(undefined, { type: 'any' }),
    room: RoomReducer(undefined, { type: 'any' }),
    battle: battleReducer(undefined, { type: 'any' }),
    ...initialState
});
