import { SetIDCAction, TimerTester } from "@timeflies/shared";
import { Server, WebSocket } from "mock-socket";
import { WSSocket } from "./WSSocket";

describe('WSSocket', () => {

    const timerTester = new TimerTester();

    const URL = `ws://localhost:1234`;

    let server: Server;

    let client: WebSocket;

    beforeEach(() => {
        timerTester.beforeTest();

        if (client) {
            client.close();
        }
        if (server) {
            server.close();
        }
        server = new Server(URL);
    });

    afterAll(() => {
        timerTester.afterTest();
    });

    test('client socket should connect to server', () => {
        client = new WebSocket(URL);

        const fnopen = jest.fn();

        client.onopen = fnopen;

        jest.runOnlyPendingTimers();

        expect(fnopen).toHaveBeenCalled();
    });

    test('action set-id should set the socket ID', () => {

        const action: SetIDCAction = {
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
