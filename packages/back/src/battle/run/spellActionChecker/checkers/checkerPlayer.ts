import { CheckerCreator } from '../SpellActionChecker';

export const checkerPlayer: CheckerCreator = (cycle, mapManager) => (action, player) => {
    const { currentTurn } = cycle.globalTurn;

    if (currentTurn.character.player.id !== player.id) {
        console.log('check player', currentTurn.character.player.id, player.id);
        return {
            success: false,
            reason: 'player'
        };
    }

    return {
        success: true
    };
};
