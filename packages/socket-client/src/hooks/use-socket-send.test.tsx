import { act } from '@testing-library/react-hooks';
import { Message } from '@timeflies/socket-messages';
import { createFakeSocketHelper, renderWithContext, describeSocketFailures } from '../test-utils';
import { useSocketSend } from './use-socket-send';


describe('# use socket send', () => {

    const messages: Message[] = [
        {
            action: 'foo',
            payload: {}
        },
        {
            action: 'bar',
            payload: {}
        }
    ];

    describeSocketFailures(useSocketSend, ...messages);

    it('directly send messages with socket open', async () => {

        const socketHelper = createFakeSocketHelper(WebSocket.OPEN);

        const result = renderWithContext(socketHelper, useSocketSend);

        await act(() =>
            result.current(...messages)
        );

        expect(socketHelper.send).toHaveBeenNthCalledWith(1, messages);
    });

    it('wait socket connecting then send messages', async () => {

        const socketHelper = createFakeSocketHelper(WebSocket.CONNECTING);

        const result = renderWithContext(socketHelper, useSocketSend);

        const actPromise = act(() =>
            result.current(...messages)
        );

        expect(socketHelper.send).not.toHaveBeenCalled();

        socketHelper.listeners.open.forEach(fn => fn());

        await actPromise;

        expect(socketHelper.send).toHaveBeenNthCalledWith(1, messages);
    });
});
