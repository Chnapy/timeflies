import { act } from '@testing-library/react-hooks';
import { timerTester } from '@timeflies/devtools';
import { MessageWithResponse, MessageWithResponseGetter } from '@timeflies/socket-messages';
import { createFakeSocket, createMessageEvent, describeSocketFailures, renderWithContext } from '../test-utils';
import { useSocketSendWithResponse } from './use-socket-send-with-response';

describe('# use socket send with response', () => {

    const message: MessageWithResponse<{ foo: 8 }> = {
        action: 'foo',
        payload: { foo: 8 },
        requestId: 'request_id'
    };

    const response: MessageWithResponse<{ bar: 2 }> = {
        action: 'foo',
        payload: { bar: 2 },
        requestId: 'request_id'
    };

    const messageGetter: MessageWithResponseGetter<{ foo: 8 }, { bar: 2 }> = {
        get: () => message
    };

    describeSocketFailures(useSocketSendWithResponse, messageGetter);

    it('send message then receive expected response', async () => {

        const socket = createFakeSocket(WebSocket.OPEN);

        const result = renderWithContext(socket, useSocketSendWithResponse);

        let hookPromise;

        act(() => {
            hookPromise = result.current(messageGetter);
        });

        await timerTester.triggerPromises();

        expect(socket.send).toHaveBeenNthCalledWith(1, JSON.stringify(messageGetter.get()));

        const badResponse = {
            ...response,
            requestId: 'another_id'
        };

        socket.listeners.message.forEach(listener => listener(createMessageEvent(badResponse, response)));

        expect(await hookPromise).toEqual(response);
    });
});
