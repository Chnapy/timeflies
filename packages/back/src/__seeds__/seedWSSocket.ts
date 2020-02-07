import WebSocket from 'ws';
import { ServerAction } from '@timeflies/shared';
jest.mock('ws');

export const seedWebSocket = ({ onSendFn }: {
    onSendFn?: () => (action: ServerAction) => void
} = {}): WebSocket => {
    const s = new WebSocket('');

    const _send = s.send.bind(s);
    s.send = (...args: any[]) => {

        // mock can fail...
        try {
            (_send as any)(...args);
        } catch (e) { }
        
        if (onSendFn)
            onSendFn()(JSON.parse(args[0] as string));
    };

    return s;
};
