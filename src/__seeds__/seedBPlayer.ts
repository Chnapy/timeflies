import { BPlayer, Player } from "../shared/Player";
import { WSSocket } from "../transport/ws/WSSocket";
import { seedBTeam } from "./seedBTeam";
import WebSocket from 'ws';
jest.mock('ws');

let id = 0;
const SEED_PLAYER: () => Player = () => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_player_' + id,
        state: 'init',
        staticCharacters: [],
        socket: new WSSocket(new WebSocket(''))
    };
};

export const seedBPlayer = (partialPlayer: Partial<Player> = {}): BPlayer => {
    return new BPlayer({
        ...SEED_PLAYER(),
        ...partialPlayer
    }, seedBTeam());
};
