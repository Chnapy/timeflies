import { PlayerSnapshot } from '@timeflies/shared';
import { GameState } from '../../../../game-state';

export type Player = {
    id: string;
    name: string;
    teamId: string;
};

export const playerToSnapshot = ({ id, name, teamId }: Player): PlayerSnapshot => {
    return {
        id,
        name,
        teamId
    };
};

export const playerIsMine = (currentPlayer: GameState['currentPlayer'], playerId: string) => currentPlayer?.id === playerId;

export const Player = (
    {
        id,
        teamId,
        name
    }: PlayerSnapshot
): Player => {

    return {
        id,
        name,
        teamId
    };
};
