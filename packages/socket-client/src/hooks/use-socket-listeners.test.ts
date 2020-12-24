import { act } from '@testing-library/react-hooks';
import { Message } from '@timeflies/socket-messages';
import { createFakeSocket, createMessageEvent, describeSocketFailures, renderWithContext } from '../test-utils';
import { useSocketListeners } from './use-socket-listeners';

describe('# use socket listeners', () => {

    describeSocketFailures(useSocketListeners, {});

    it('add listeners which can be removed', async () => {
        const socket = createFakeSocket(WebSocket.OPEN);

        const result = renderWithContext(socket, useSocketListeners);

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

        const messageEvent = createMessageEvent(messageBar, messageFoo);

        socket.listeners.message.forEach(fn => fn(messageEvent));

        expect(listeners.foo).toHaveBeenNthCalledWith(1, messageFoo);
        expect(listeners.bar).toHaveBeenNthCalledWith(1, messageBar);

        removeListeners();

        listeners.foo.mockReset();
        listeners.bar.mockReset();

        socket.listeners.message.forEach(fn => fn(messageEvent));

        expect(listeners.foo).not.toHaveBeenCalled();
        expect(listeners.bar).not.toHaveBeenCalled();
    });
});
