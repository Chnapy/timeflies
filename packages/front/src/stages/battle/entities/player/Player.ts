import { PlayerEntity, PlayerSnapshot } from '@timeflies/shared';
import { GameState } from '../../../../game-state';

// should not use entity directly, for future updates
export type Player = PlayerEntity;

export const playerIsMine = (auth: GameState['auth'], playerId: string) => auth.id === playerId;

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
