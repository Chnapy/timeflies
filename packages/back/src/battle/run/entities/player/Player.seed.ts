import { PlayerData } from "../../../../PlayerData";
import { WSSocket } from '../../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../../transport/ws/WSSocket.seed';
import { seedTeam } from "../team/Team.seed";
import { Player } from "./Player";

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
