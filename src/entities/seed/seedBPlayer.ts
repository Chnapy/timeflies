import { BPlayer, Player } from "../../shared/Player";
import { WSSocket } from "../../transport/ws/WSSocket";
import { seedBTeam } from "./seedBTeam";
import * as M from "mock-socket";

// TODO extract to file
const mockSocket = (): WSSocket => {

    const socket = new M.WebSocket('ws://localhost:1234');
    socket.on = () => {};

    return new WSSocket(socket as any);
};

let id = 0;
const SEED_PLAYER: () => Player = () => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_player_' + id,
        state: 'init',
        staticCharacters: [],
        socket: mockSocket()
    };
};

export const seedBPlayer = (partialPlayer: Partial<Player> = {}): BPlayer => {
    return new BPlayer({
        ...SEED_PLAYER(),
        ...partialPlayer
    }, seedBTeam());
};
