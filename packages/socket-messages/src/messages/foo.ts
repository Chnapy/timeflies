import { createMessage } from '../message';

export const FooMessage = createMessage<{ value: 8 }>('foo');

export const BarMessage = createMessage<{ content: string }>('bar')
    .withResponse<{ checked: boolean }>();
