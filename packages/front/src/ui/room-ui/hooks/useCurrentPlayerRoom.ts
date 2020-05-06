import { PlayerRoom, assertIsDefined } from '@timeflies/shared';
import { useGameCurrentPlayer } from '../../hooks/useGameCurrentPlayer';
import { useGameStep } from '../../hooks/useGameStep';

export const useCurrentPlayerRoom = <R>(selector: (player: PlayerRoom) => R): R => {

    const id = useGameCurrentPlayer(currentPlayer => currentPlayer.id);

    const currentPlayerRoom = useGameStep('room', ({ teamsTree }) =>
        teamsTree.playerList.find(p => p.id === id)
    );
    assertIsDefined(currentPlayerRoom);

    return selector(currentPlayerRoom);
};
