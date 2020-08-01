import WebSocket from 'ws';
import { Auth } from './battle/auth/auth';
import { RoomList } from './battle/room-list/room-list';

export class App {

    private readonly auth: Auth;
    private readonly roomList: RoomList;

    constructor() {
        this.auth = Auth();
        this.roomList = RoomList();
    }

    getAuthRoute() {
        return this.auth.route();
    }

    init(ws: WebSocket.Server): void {
        ws.on('connection', (rawSocket, req) => {

            const playerData = this.auth.onClientSocket(rawSocket, req);

            if (!playerData) {
                return;
            }

            this.roomList.onPlayerConnect(playerData);
        });
    }
}
