import { Server, WebSocket } from "mock-socket";
import { WSSocket, SetIDTAction } from "./WSSocket";

describe('WSSocket', () => {
    const URL = `ws://localhost:1234`;

    jest.useFakeTimers();

    let server: Server;

    let client: WebSocket;

    beforeEach(() => {
        if (client) {
            client.close();
        }
        if (server) {
            server.close();
        }
        server = new Server(URL);
    });

    test('client socket should connect to server', () => {
        client = new WebSocket(URL);

        const fnopen = jest.fn();

        client.onopen = fnopen;

        jest.runOnlyPendingTimers();

        expect(fnopen).toHaveBeenCalled();
    });

    test('action set-id should set the socket ID', () => {

        const action: SetIDTAction = {
            type: 'set-id',
            sendTime: Date.now(),
            id: 'hummus'
        };

        let wss: WSSocket | undefined;
        server.on('connection', socket => {

            wss = new WSSocket(socket as any);
        });

        client = new WebSocket(URL);
        
        jest.runOnlyPendingTimers();

        client.send(JSON.stringify(action));

        jest.runOnlyPendingTimers();

        expect(wss).toBeDefined();
        expect(wss!.id).toBe(action.id);
    })
});
