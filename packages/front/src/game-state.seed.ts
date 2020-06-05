import { GameState } from './game-state';
import { battleReducer } from './ui/reducers/battle-reducers/battle-reducer';

export const seedGameState = (playerId: string, initialState: Partial<GameState>): GameState => ({
    currentPlayer: {
        id: playerId,
        name: playerId
    },
    step: 'boot',
    room: null,
    battle: battleReducer(undefined, { type: 'any' }),
    ...initialState
});
