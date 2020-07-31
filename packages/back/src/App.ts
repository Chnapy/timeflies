import WebSocket from 'ws';
import { Auth } from './battle/auth/auth';
import { RoomList } from './battle/room-list/room-list';

export class App {

    private readonly ws: WebSocket.Server;
    private readonly auth: Auth;
    private readonly roomList: RoomList;

    constructor(ws: WebSocket.Server) {
        this.ws = ws;
        this.auth = Auth();
        this.roomList = RoomList();
    }

    init(): void {
        this.ws.on('connection', rawSocket => {

            const playerData = this.auth.onClientSocket(rawSocket);

            if(!playerData) {
                return;
            }

            this.roomList.onPlayerConnect(playerData)

             // TODO remove matchmaker
             // move room-list here
             // remove player service

            // const socket = new WSSocket(_socket);
            // const appPool = socket.createPool();
            // appPool.on<MatchmakerEnterCAction>('matchmaker/enter', action => {

            //     this.matchmaker.connection(socket);
            // });
        });
    }
}
