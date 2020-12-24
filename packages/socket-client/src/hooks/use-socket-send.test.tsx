import { act } from '@testing-library/react-hooks';
import { Message } from '../message';
import { createFakeSocket, renderWithContext, describeSocketFailures } from '../test-utils';
import { useSocketSend } from './use-socket-send';


describe('# use socket send', () => {

    const message: Message = {
        action: 'foo',
        payload: {}
    };

    describeSocketFailures(useSocketSend, message);

    it('directly send message with socket open', async () => {

        const socket = createFakeSocket(WebSocket.OPEN);

        const result = renderWithContext(socket, useSocketSend);

        await act(() =>
            result.current(message)
        );

        expect(socket.send).toHaveBeenNthCalledWith(1, JSON.stringify(message));
    });

    it('wait socket connecting then send message', async () => {

        const socket = createFakeSocket(WebSocket.CONNECTING);

        const result = renderWithContext(socket, useSocketSend);

        const actPromise = act(() =>
            result.current(message)
        );

        expect(socket.send).not.toHaveBeenCalled();

        socket.listeners.open.forEach(fn => fn());

        await actPromise;

        expect(socket.send).toHaveBeenNthCalledWith(1, JSON.stringify(message));
    });
});
