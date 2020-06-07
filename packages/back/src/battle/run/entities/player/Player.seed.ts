import { PlayerRoom } from '@timeflies/shared';
import { WSSocket, WSSocketPool } from '../../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../../transport/ws/WSSocket.seed';
import { Player } from "./Player";

let id = 0;
export const seedPlayer = (partialPlayer: Partial<PlayerRoom> = {}, teamId?: string, socket?: WSSocketPool): Player => {
    id++;
    return Player(
        {
            id: id.toString(),
            name: 'sample_player_' + id,
            ...partialPlayer
        },
        teamId ?? 't1',
        socket ?? new WSSocket(seedWebSocket().ws).createPool()
    );
};
