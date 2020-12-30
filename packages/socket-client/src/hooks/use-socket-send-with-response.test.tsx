import { act } from '@testing-library/react-hooks';
import { timerTester } from '@timeflies/devtools';
import { MessageWithResponse, MessageWithResponseGetter } from '@timeflies/socket-messages';
import { createFakeSocketHelper, describeSocketFailures, renderWithContext } from '../test-utils';
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

        const socketHelper = createFakeSocketHelper(WebSocket.OPEN);

        const result = renderWithContext(socketHelper, useSocketSendWithResponse);

        let hookPromise;

        act(() => {
            hookPromise = result.current(messageGetter);
        }) as unknown as void;

        await timerTester.triggerPromises();

        expect(socketHelper.send).toHaveBeenNthCalledWith(1, [ messageGetter.get() ]);

        const badResponse = {
            ...response,
            requestId: 'another_id'
        };

        socketHelper.listeners.message.forEach(listener => listener([ badResponse, response ]));

        expect(await hookPromise).toEqual(response);
    });
});
