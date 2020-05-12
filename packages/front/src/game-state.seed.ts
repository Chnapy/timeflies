import { GameState } from './game-state';

export const seedGameState = (playerId: string, initialState: Partial<GameState>): GameState => ({
    currentPlayer: {
        id: playerId,
        name: playerId
    },
    step: 'boot',
    room: null,
    battle: null,
    ...initialState
});
