import { PlayerRoom, PlayerSnapshot } from '@timeflies/shared';
import { WSSocketPool } from "../../../../transport/ws/WSSocket";

export type Player = {
    id: string;
    name: string;
    socket: WSSocketPool;
    teamId: string;
};

export const playerToSnapshot = ({ id, name, teamId }: Player): PlayerSnapshot => ({
    id,
    name,
    teamId
});

export const Player = (
    { id, name }: Pick<PlayerRoom, 'id' | 'name'>,
    teamId: string,
    socket: WSSocketPool
): Player => {

    return {
        id,
        name,
        socket,
        teamId
    };
};
