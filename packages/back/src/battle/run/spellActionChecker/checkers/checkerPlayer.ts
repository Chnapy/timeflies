import { CheckerCreator } from '../SpellActionChecker';

export const checkerPlayer: CheckerCreator = (cycle, mapManager) => (action, player) => {
    const { currentTurn } = cycle.globalTurn;

    if (currentTurn.getCharacter().playerId !== player.id) {
        console.log('check player', currentTurn.getCharacter().playerId, player.id);
        return {
            success: false,
            reason: 'player'
        };
    }

    return {
        success: true
    };
};
