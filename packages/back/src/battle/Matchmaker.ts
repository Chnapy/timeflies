import WebSocket from "ws";
import { PlayerService } from "../PlayerService";
import { WSSocket } from "../transport/ws/WSSocket";
import { RoomList } from './room-list/room-list';
import { PlayerRoomData } from './room/room';

export class Matchmaker {

    private readonly ws: WebSocket.Server;

    private readonly playerService: PlayerService;

    private readonly players: Record<string, PlayerRoomData>;

    private readonly roomList: RoomList;

    private tempIndex = 0;

    constructor(ws: WebSocket.Server) {
        this.ws = ws;
        this.playerService = new PlayerService();
        this.players = {};
        this.roomList = RoomList();
    }

    connection(socket: WSSocket): void {
        const player = this.playerService.getPlayer(socket, this.tempIndex);
        this.tempIndex++;
        this.players[ player.id ] = player;

        this.roomList.onPlayerConnect(player);
    }
}