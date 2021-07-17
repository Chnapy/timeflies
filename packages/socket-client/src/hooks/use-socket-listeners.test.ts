import { act } from '@testing-library/react-hooks';
import { Message } from '@timeflies/socket-messages';
import { createFakeSocketHelper, describeSocketFailures, renderWithContext } from '../test-utils';
import { useSocketListeners } from './use-socket-listeners';

describe('# use socket listeners', () => {

    describeSocketFailures(useSocketListeners, {});

    it('throw error if same action given twice', async () => {
        const socketHelper = createFakeSocketHelper(WebSocket.OPEN);

        const result = renderWithContext(socketHelper, useSocketListeners);

        const listeners = {
            'foo': jest.fn(),
            'bar': jest.fn()
        };

        const groupListeners = {
            'toto': jest.fn(),
            'foo': jest.fn()
        };

        await expect(
            act(async () => {
                await result.current(listeners, groupListeners)
            })
        ).rejects.toBeDefined();
    });

    it('add listeners which can be removed', async () => {
        const socketHelper = createFakeSocketHelper(WebSocket.OPEN);

        const result = renderWithContext(socketHelper, useSocketListeners);

        const listeners = {
            'foo': jest.fn(),
            'bar': jest.fn()
        };

        let removeListeners!: () => void;

        await act(async () => {
            removeListeners = await result.current(listeners)
        });

        const messageBar: Message = {
            action: 'bar',
            payload: {}
        };

        const messageFoo: Message = {
            action: 'foo',
            payload: {}
        };

        const messageList = [ messageBar, messageFoo ];

        socketHelper.listeners.message.forEach(fn => fn(messageList));

        expect(listeners.foo).toHaveBeenNthCalledWith(1, messageFoo);
        expect(listeners.bar).toHaveBeenNthCalledWith(1, messageBar);

        removeListeners();

        listeners.foo.mockReset();
        listeners.bar.mockReset();

        socketHelper.listeners.message.forEach(fn => fn(messageList));

        expect(listeners.foo).not.toHaveBeenCalled();
        expect(listeners.bar).not.toHaveBeenCalled();
    });

    it('add group listeners which can be removed', async () => {
        const socketHelper = createFakeSocketHelper(WebSocket.OPEN);

        const result = renderWithContext(socketHelper, useSocketListeners);

        const groupListeners = {
            'foo': jest.fn(),
            'bar': jest.fn()
        };

        let removeListeners!: () => void;

        await act(async () => {
            removeListeners = await result.current({}, groupListeners)
        });

        const messageBar: Message = {
            action: 'bar',
            payload: {}
        };

        const messageFoo: Message = {
            action: 'foo',
            payload: {}
        };

        const messageList = [ messageBar, messageFoo, messageBar, messageBar ];

        socketHelper.listeners.message.forEach(fn => fn(messageList));

        expect(groupListeners.foo).toHaveBeenNthCalledWith(1, [ messageFoo ]);
        expect(groupListeners.bar).toHaveBeenNthCalledWith(1, [ messageBar, messageBar, messageBar ]);

        removeListeners();

        groupListeners.foo.mockReset();
        groupListeners.bar.mockReset();

        socketHelper.listeners.message.forEach(fn => fn(messageList));

        expect(groupListeners.foo).not.toHaveBeenCalled();
        expect(groupListeners.bar).not.toHaveBeenCalled();
    });
});
