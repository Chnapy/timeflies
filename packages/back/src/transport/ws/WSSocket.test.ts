import { ErrorServerAction, ServerAction, SetIDCAction, TimerTester, ClientAction, assertIsDefined } from "@timeflies/shared";
import WebSocket from 'ws';
import { WSError } from './WSError';
import { WSSocket } from "./WSSocket";

describe('WSSocket', () => {

    const timerTester = new TimerTester();

    const initialize = () => {

        const sendList: ServerAction[] = [];

        let onmessage: ((message: string) => Promise<void>) | undefined;
        let onclose: (() => void) | undefined;

        const socket: WebSocket = {
            readyState: 1,
            OPEN: 1,
            on: (event: string, listener: any) => {
                if (event === 'message') onmessage = listener;
                if (event === 'close') onclose = listener;
                return socket;
            },
            send: (message: string) => {
                sendList.push(...JSON.parse(message as string));
            }
        } as any;

        const wss = new WSSocket(socket);

        assertIsDefined(onmessage);
        assertIsDefined(onclose);

        const clientSendAny = (message: any) => onmessage!(JSON.stringify(message));

        const clientSend = (action: ClientAction) => clientSendAny([ action ]);

        const clientClose = () => {
            socket.readyState = 0;
            onclose!();
        };

        return {
            wss,
            sendList,
            clientSendAny,
            clientSend,
            clientClose
        };
    };

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('action set-id should set the socket ID', async () => {
        const { clientSend, wss } = initialize();

        const action: SetIDCAction = {
            type: 'set-id',
            sendTime: Date.now(),
            id: 'hummus'
        };

        await clientSend(action);

        expect(wss.id).toBe(action.id);
    });

    describe('error management', () => {

        it('should reply error 400 if message is not stringified action list', async () => {
            const { sendList, clientSendAny } = initialize();

            await clientSendAny(12);

            await clientSendAny({ type: 'not-matter' });

            expect(sendList).toEqual<[ ErrorServerAction, ErrorServerAction ]>([ {
                type: 'error',
                sendTime: expect.anything(),
                code: 400
            }, {
                type: 'error',
                sendTime: expect.anything(),
                code: 400
            } ]);
        });

        it('should reply error 404 if no listener for the sended action', async () => {
            const { sendList, clientSend } = initialize();

            await clientSend({
                type: 'unknown'
            } as any);

            expect(sendList).toEqual<[ ErrorServerAction ]>([ {
                type: 'error',
                sendTime: expect.anything(),
                code: 404
            } ]);
        });

        it('should reply given error on listener error', async () => {
            const { wss, sendList, clientSend } = initialize();

            const pool = wss.createPool();

            pool.on('room/create', () => {
                throw new WSError(401, 'test');
            });

            await clientSend({
                type: 'room/create',
                sendTime: -1
            });

            expect(sendList).toEqual<[ ErrorServerAction ]>([ {
                type: 'error',
                sendTime: expect.anything(),
                code: 401
            } ]);
        });

        it('should reply error 500 on unknown listener error', async () => {
            const { wss, sendList, clientSend } = initialize();

            const pool = wss.createPool();

            pool.on('room/create', () => {
                throw new TypeError();
            });

            await clientSend({
                type: 'room/create',
                sendTime: -1
            });

            expect(sendList).toEqual<[ ErrorServerAction ]>([ {
                type: 'error',
                sendTime: expect.anything(),
                code: 500
            } ]);
        });
    });

    describe('pool management', () => {

        it('should return correct connected status', () => {
            const { wss, clientClose } = initialize();

            const pool = wss.createPool();

            expect(pool.isConnected()).toBe(true);

            clientClose();

            expect(pool.isConnected()).toBe(false);
        });

        it('should send message', () => {
            const { wss, sendList } = initialize();

            const pool = wss.createPool();

            pool.send({
                type: 'confirm',
                isOk: true,
                lastCorrectHash: ''
            });

            expect(sendList).toEqual([ {
                type: 'confirm',
                sendTime: expect.anything(),
                isOk: true,
                lastCorrectHash: ''
            } ]);
        });

        it('should send error message', () => {
            const { wss, sendList } = initialize();

            const pool = wss.createPool();

            pool.sendError(new WSError(403, 'test'));

            expect(sendList).toEqual<[ ErrorServerAction ]>([ {
                type: 'error',
                sendTime: expect.anything(),
                code: 403
            } ]);
        });

        it('should throw error on add listener that already exist', () => {
            const { wss } = initialize();

            const pool1 = wss.createPool();

            pool1.on('room/map/list', () => { });
            expect(() => pool1.on('room/map/list', () => { })).toThrowError();
        });

        it('should add listener which can be called', async () => {
            const { wss, clientSend } = initialize();

            const pool1 = wss.createPool();
            const pool2 = wss.createPool();

            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const fn3 = jest.fn();

            pool1.on('room/map/list', fn1);
            pool1.on("room/player/leave", fn2);
            pool2.on('room/map/list', fn3);

            await clientSend({
                type: 'room/map/list',
                sendTime: -1
            });

            await clientSend({
                type: 'room/player/leave',
                sendTime: -1
            });

            expect(fn1).toHaveBeenNthCalledWith(1, {
                type: 'room/map/list',
                sendTime: -1
            });
            expect(fn2).toHaveBeenNthCalledWith(1, {
                type: 'room/player/leave',
                sendTime: -1
            });
            expect(fn3).toHaveBeenNthCalledWith(1, {
                type: 'room/map/list',
                sendTime: -1
            });
        });

        it('should call disconnect given function on client disconnect', () => {

            const { wss, clientClose } = initialize();

            const pool = wss.createPool();

            const disconnectFn = jest.fn();

            pool.onDisconnect(disconnectFn);

            clientClose();

            expect(disconnectFn).toHaveBeenCalledTimes(1);
        });

        it('should clear listeners on pool close', async () => {

            const { wss, clientSend } = initialize();

            const pool = wss.createPool();

            const fn = jest.fn();

            pool.on('room/map/list', fn);

            pool.close();

            await clientSend({
                type: 'room/map/list',
                sendTime: -1
            });

            expect(fn).not.toHaveBeenCalled();
        });
    });
});
