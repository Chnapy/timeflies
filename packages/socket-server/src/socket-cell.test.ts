import { ErrorCode, Message, MessageWithResponse, MessageWithResponseCreator, SocketErrorMessage } from '@timeflies/socket-messages';
import WebSocket from 'ws';
import { createSocketCell } from './socket-cell';
import { SocketError } from './socket-error';

describe('# Socket cell', () => {

    type SocketTestable = WebSocket & {
        _listeners: { [ type in 'open' | 'message' | 'close' | 'error' ]: Set<(...args: any[]) => void> };
    };

    const createFakeSocket = (): SocketTestable => {

        const _listeners: SocketTestable[ '_listeners' ] = {
            open: new Set(),
            message: new Set(),
            close: new Set(),
            error: new Set()
        };

        const addEventListenerFn = jest.fn((type: keyof SocketTestable[ '_listeners' ], listener) => {
            _listeners[ type ].add(listener);
        });
        const removeEventListenerFn = jest.fn((type: keyof SocketTestable[ '_listeners' ], listener) => {
            _listeners[ type ].delete(listener);
        });

        return {
            close: jest.fn() as any,
            send: jest.fn() as any,
            addEventListener: addEventListenerFn as any,
            removeEventListener: removeEventListenerFn as any,
            _listeners
        } as SocketTestable;
    };

    const createSocketAndCell = () => {
        const socket = createFakeSocket();
        const cell = createSocketCell(socket);

        const socketHelper = {
            socket,
            expectSendCalledWithMessages: (messages: (Message | MessageWithResponse)[]) =>
                expect(socket.send).toHaveBeenCalledWith(JSON.stringify(messages)),
            triggerMessageListeners: (messages: Message[] | 'dirty-content') =>
                Promise.all(
                    Array.from(socket._listeners.message.values()).map(fn => fn({
                        data: JSON.stringify(messages)
                    }))
                ),
            triggerDisconnectListeners: () => socket._listeners.close.forEach(fn => fn())
        };

        return { socketHelper, cell };
    };

    const messageFoo: Message = {
        action: 'foo',
        payload: {}
    };

    const messageBar: MessageWithResponse = {
        action: 'bar',
        payload: {},
        requestId: 'bar_id'
    };

    const messages = [ messageFoo, messageBar ];

    it('send messages correctly', () => {
        const { socketHelper, cell } = createSocketAndCell();

        cell.send(...messages);

        socketHelper.expectSendCalledWithMessages(messages);
    });

    describe('message listener', () => {

        it('add removable listener for a given message', async () => {
            const { socketHelper, cell } = createSocketAndCell();

            const listener = jest.fn();

            const removeListener = cell.addMessageListener({
                match: (message): message is any => message.action === 'foo'
            }, listener);

            await socketHelper.triggerMessageListeners(messages);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(messageFoo);

            listener.mockClear();

            removeListener();

            await socketHelper.triggerMessageListeners(messages);

            expect(listener).not.toHaveBeenCalled();
        });

        const expectSendErrorMessage = (code: ErrorCode) => ({
            with: async (listenerFn: () => void, messages: any) => {
                const { socketHelper, cell } = createSocketAndCell();

                const listener = jest.fn(listenerFn);

                cell.addMessageListener({
                    match: (message): message is any => message.action === 'foo'
                }, listener);

                await socketHelper.triggerMessageListeners(messages);

                socketHelper.expectSendCalledWithMessages([ SocketErrorMessage({ code }) ]);
            }
        })

        it('send error if listener throws socket error', async () => {
            await expectSendErrorMessage(403).with(
                () => {
                    throw new SocketError(403, 'foo error');
                },
                messages
            );
        });

        it('send socket error 500 if listener throws error being not socket error', async () => {
            await expectSendErrorMessage(500).with(
                () => {
                    throw new TypeError('unexpected error');
                },
                messages
            );
        });

        it('send socket error 400 if bad message format', async () => {
            await expectSendErrorMessage(400).with(
                () => { },
                'dirty-content'
            );
        });

        it('send response if any returned by listener', async () => {
            const { socketHelper, cell } = createSocketAndCell();

            const listener = jest.fn(async (): Promise<MessageWithResponse> => {
                return Promise.resolve({
                    action: 'toto',
                    payload: {},
                    requestId: 'bar_id'
                });
            });

            cell.addMessageListener<MessageWithResponseCreator>({
                match: (message): message is any => true
            }, listener);

            await socketHelper.triggerMessageListeners([ messageBar ]);

            socketHelper.expectSendCalledWithMessages([
                {
                    action: 'toto',
                    payload: {},
                    requestId: 'bar_id'
                }
            ]);
        });
    });

    it('add removable disconnect listener', () => {
        const { socketHelper, cell } = createSocketAndCell();

        const listener = jest.fn();

        const removeListener = cell.addDisconnectListener(listener);

        socketHelper.triggerDisconnectListeners();

        expect(listener).toHaveBeenCalledTimes(1);

        listener.mockClear();

        removeListener();

        socketHelper.triggerDisconnectListeners();

        expect(listener).not.toHaveBeenCalled();
    });

    describe('close socket', () => {
        it('closes socket correctly', () => {
            const { socketHelper, cell } = createSocketAndCell();

            cell.closeSocket();

            expect(socketHelper.socket.close).toHaveBeenCalledTimes(1);
        });

        it('send error if any given', () => {
            const { socketHelper, cell } = createSocketAndCell();

            cell.closeSocket(
                new SocketError(403, 'foo')
            );

            socketHelper.expectSendCalledWithMessages([ SocketErrorMessage({ code: 403 }) ]);
        });
    });

    it('clear all listeners correctly', async () => {
        const { socketHelper, cell } = createSocketAndCell();

        const listener = jest.fn();

        cell.addMessageListener({
            match: (message): message is any => true
        }, listener);

        cell.addDisconnectListener(listener);

        cell.clearAllListeners();

        await socketHelper.triggerMessageListeners(messages);
        socketHelper.triggerDisconnectListeners();

        expect(listener).not.toHaveBeenCalled();
    });

    it('create an independant new cell', () => {
        const { socketHelper, cell } = createSocketAndCell();

        const listener = jest.fn();
        cell.addDisconnectListener(listener);

        const newCell = cell.createCell();

        newCell.clearAllListeners();

        socketHelper.triggerDisconnectListeners();

        expect(listener).toHaveBeenCalledTimes(1);
    });
});
