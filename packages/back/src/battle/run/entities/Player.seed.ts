import { PlayerData } from "../../../PlayerData";
import { Player } from "./Player";
import { seedTeam } from "./Team.seed";
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { WSSocket } from '../../../transport/ws/WSSocket';

let id = 0;
const SEED_PLAYER: () => PlayerData = () => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_player_' + id,
        state: 'init',
        staticCharacters: [],
        socket: new WSSocket(seedWebSocket())
    };
};

export const seedPlayer = (partialPlayer: Partial<PlayerData> = {}): Player => {
    return Player({
        ...SEED_PLAYER(),
        ...partialPlayer
    }, seedTeam());
};
