import { Player } from "../Player";
import { BPlayer } from "../battle/run/entities/BPlayer";
import { seedBTeam } from "./seedBTeam";
import { seedWebSocket } from './seedWSSocket';
import { WSSocket } from '../transport/ws/WSSocket';

let id = 0;
const SEED_PLAYER: () => Player = () => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_player_' + id,
        state: 'init',
        staticCharacters: [],
        socket: new WSSocket(seedWebSocket())
    };
};

export const seedBPlayer = (partialPlayer: Partial<Player> = {}): BPlayer => {
    return new BPlayer({
        ...SEED_PLAYER(),
        ...partialPlayer
    }, seedBTeam());
};
