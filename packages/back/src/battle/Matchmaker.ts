import WebSocket from "ws";
import { PlayerData } from "../PlayerData";
import { PlayerService } from "../PlayerService";
import { WSSocket } from "../transport/ws/WSSocket";
import { Room } from './room/room';

export class Matchmaker {

    private readonly ws: WebSocket.Server;

    private readonly playerService: PlayerService;

    private readonly players: Record<string, PlayerData>;

    // private readonly battlePrepareRooms: BattlePrepareRoom[];
    private readonly roomList: Room[];

    private tempIndex = 0;

    constructor(ws: WebSocket.Server) {
        this.ws = ws;
        this.playerService = new PlayerService();
        this.players = {};
        // this.battlePrepareRooms = [];
        this.roomList = [];
    }

    connection(socket: WSSocket): void {
        const player = this.playerService.getPlayer(socket, this.tempIndex);
        this.tempIndex++;
        this.players[ player.id ] = player;

        this.onPrepareNewPlayer(player);
    }

    private onPrepareNewPlayer = (player: PlayerData): void => {
        const room = this.getOpenBattleRoom();
        room.onJoin(player);
    }

    private getOpenBattleRoom(): Room {
        let room = this.roomList.find(b => b.isOpen());
        if (!room) {
            room = Room();
            this.roomList.push(room);
        }

        return room;
    }
}