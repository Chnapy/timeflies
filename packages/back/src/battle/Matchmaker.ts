import { BattlePrepareRoom } from "./prepare/BattlePrepareRoom";
import { PlayerData } from "../PlayerData";
import { PlayerService } from "../PlayerService";
import WebSocket  from "ws";
import { WSSocket } from "../transport/ws/WSSocket";

// const namespaceStr = 'battle';

export class Matchmaker {

    private readonly ws: WebSocket.Server;
    // private readonly namespace: Namespace;

    private readonly playerService: PlayerService;

    private readonly players: Record<string, PlayerData>;

    private readonly battlePrepareRooms: BattlePrepareRoom[];

    constructor(ws: WebSocket.Server) {
        this.ws = ws;
        // this.namespace = io.of(namespaceStr);
        this.playerService = new PlayerService();
        this.players = {};
        this.battlePrepareRooms = [];
    }

    connection(socket: WSSocket): void {
        const player = this.playerService.getPlayer(socket);
        this.players[player.id] = player;

        switch (player.state) {
            case 'init':
                this.onPrepareNewPlayer(player);
                break;
        }
    }

    private onPrepareNewPlayer = (player: PlayerData): void => {
        const room = this.getOpenBattleRoom();
        room.addPlayer(player);
    }

    private getOpenBattleRoom(): BattlePrepareRoom {
        let room = this.battlePrepareRooms.find(b => b.isOpen());
        if (!room) {
            room = new BattlePrepareRoom();
            this.battlePrepareRooms.push(room);
        }

        return room;
    }
}