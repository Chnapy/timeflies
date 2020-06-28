import { PlayerRoom, PlayerEntity } from '@timeflies/shared';
import { WSSocketPool } from "../../../../transport/ws/WSSocket";

export type Player = PlayerEntity & {
    socket: WSSocketPool;
};

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
