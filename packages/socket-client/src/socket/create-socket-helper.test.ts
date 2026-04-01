import { timerTester } from '@timeflies/devtools';
import { getSocketHelperCreator } from './create-socket-helper';

const originalWebSocket = (global as any).WebSocket;

describe('# create socket helper', () => {

    const mockWebSocket = () => {
        let socket: Pick<WebSocket, 'send'>;

        (global as any).WebSocket = class {
            constructor(public url: string) {
                socket = this;
            }

            readyState = WebSocket.OPEN;
            send = jest.fn();
            addEventListener = jest.fn();
            removeEventListener = jest.fn();
            close = jest.fn();
        };

        return () => socket;
    };

    afterEach(() => {
        (global as any).WebSocket = originalWebSocket;
    });

    it('connect to correct endpoint', () => {
        mockWebSocket();

        const socketHelper = getSocketHelperCreator('http://myendpoint.foo.bar/toto')('my_token');

        expect(socketHelper.url).toEqual('ws://myendpoint.foo.bar/toto?token=my_token');
    });

    describe('hearbeat timeout loop', () => {

        it('send heartbeat message every 30 seconds', async () => {
            const getSocket = mockWebSocket();

            getSocketHelperCreator('foo')('bar');

            const socket = getSocket();

            await timerTester.advance(360_000);

            expect(socket.send).toHaveBeenCalledTimes(12);
        });

        it('delay hearbeat sending on regular message send', async () => {
            const getSocket = mockWebSocket();

            const socketHelper = getSocketHelperCreator('foo')('bar');

            const socket = getSocket();

            await timerTester.advance(20_000);

            socketHelper.send([ { action: 'foo', payload: {} } ]);
            (socket.send as jest.Mock).mockClear();

            await timerTester.advance(30_000, {
                runJustBeforeItEnds: () => {
                    expect(socket.send).not.toHaveBeenCalled();
                }
            });

            expect(socket.send).toHaveBeenCalled();
        });
    });
});
