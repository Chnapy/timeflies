import WebSocket from 'ws';
import { Matchmaker } from "./battle/Matchmaker";
import { WSSocket } from './transport/ws/WSSocket';

export class App {

    private readonly ws: WebSocket.Server;
    private readonly matchmaker: Matchmaker;

    constructor(ws: WebSocket.Server) {
        this.ws = ws;
        this.matchmaker = new Matchmaker(ws);
    }

    init(): void {
        this.ws.on('connection', _socket => {
            // TODO wait id before going further
            const socket = new WSSocket(_socket);
            this.matchmaker.connection(socket);
        });
    }
}
