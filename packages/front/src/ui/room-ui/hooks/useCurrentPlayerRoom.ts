import { PlayerRoom, assertIsDefined } from '@timeflies/shared';
import { useGameCurrentPlayer } from '../../hooks/useGameCurrentPlayer';
import { useGameStep } from '../../hooks/useGameStep';

export const useCurrentPlayerRoom = (): PlayerRoom => {

    const id = useGameCurrentPlayer(currentPlayer => currentPlayer.id);

    const currentPlayerRoom = useGameStep('room', ({ teamsTree }) =>
        teamsTree.playerList.find(p => p.id === id)
    );
    assertIsDefined(currentPlayerRoom);

    return currentPlayerRoom;
};
