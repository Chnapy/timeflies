import * as joi from 'joi';
import { createMessage, Message, MessageWithResponse } from './message';

describe('# Message creator', () => {

    const createFooMessage = () => createMessage<{ bar: 8 }>('foo', joi.object({
        bar: 8
    }));

    describe('Simple message creator', () => {
        it('create correct message', () => {
            const messageCreator = createFooMessage();

            expect(messageCreator({ bar: 8 })).toEqual<Message<{ bar: 8 }>>({
                action: 'foo',
                payload: { bar: 8 }
            });
        });

        it('exposes action', () => {
            const messageCreator = createFooMessage();

            expect(messageCreator.action).toEqual('foo');
        });

        it('match others actions', () => {
            const messageCreator = createFooMessage();

            expect(messageCreator.match({ action: 'bar', payload: {} })).toEqual(false);
            expect(messageCreator.match({ action: 'foo', payload: {} })).toEqual(true);
        });

        it('generates correct schema validation', () => {
            const messageCreator = createFooMessage();

            const correctAction: Message<{ bar: 8 }> = { action: 'foo', payload: { bar: 8 } };

            expect(messageCreator.schema.validate({ action: 'bad-action', payload: { bar: 8 } }).error).toBeDefined();
            expect(messageCreator.schema.validate({ action: 'foo', payload: { bar: 42 } }).error).toBeDefined();
            expect(messageCreator.schema.validate(correctAction).error).toBeUndefined();
        });
    });

    describe('With response message creator', () => {

        const createFooMessageWithResponse = () => createFooMessage().withResponse<{ toto: 2 }>();

        it('create message with unique ID', () => {
            const messageCreator = createFooMessageWithResponse();

            const isEachMessageUnique = (messages: MessageWithResponse[]) => {
                const ids = messages.map(m => m.requestId);

                return ids.length === new Set(ids).size;
            };

            const messages = [
                messageCreator({ bar: 8 }).get(),
                messageCreator({ bar: 8 }).get(),
                messageCreator({ bar: 8 }).get()
            ];

            expect(messages[ 0 ]).toEqual<MessageWithResponse<{ bar: 8 }>>({
                action: 'foo',
                payload: { bar: 8 },
                requestId: expect.any(String)
            });

            expect(isEachMessageUnique(messages)).toEqual(true);
        });

        it('exposes action', () => {
            const messageCreator = createFooMessageWithResponse();

            expect(messageCreator.action).toEqual('foo');
        });

        it('match others actions', () => {
            const messageCreator = createFooMessageWithResponse();

            expect(messageCreator.match({ action: 'bar', payload: {} })).toEqual(false);
            expect(messageCreator.match({ action: 'foo', payload: {} })).toEqual(true);
        });

        it('generates correct message schema validation', () => {
            const messageCreator = createFooMessageWithResponse();

            const correctAction: MessageWithResponse<{ bar: 8 }> = { action: 'foo', payload: { bar: 8 }, requestId: '123' };

            expect(messageCreator.schema.validate({ action: 'bad-action', payload: { bar: 8 }, requestId: '123' }).error).toBeDefined();
            expect(messageCreator.schema.validate({ action: 'foo', payload: { bar: 42 }, requestId: '123' })).toBeDefined();
            expect(messageCreator.schema.validate({ action: 'foo', payload: { bar: 8 }, requestId: '' })).toBeDefined();
            expect(messageCreator.schema.validate(correctAction).error).toBeUndefined();
        });

        it('create response', () => {
            const messageCreator = createFooMessageWithResponse();

            expect(messageCreator.createResponse('foo_id', { toto: 2 })).toEqual<MessageWithResponse<{ toto: 2 }>>({
                action: 'foo',
                payload: { toto: 2 },
                requestId: 'foo_id'
            })
        });
    });
});
