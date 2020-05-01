import { ClientAction, ServerAction } from '@timeflies/shared';
import WebSocket from 'ws';
jest.mock('ws');

export const seedWebSocket = ({ onSendFn }: {
    onSendFn?: () => (actionList: ServerAction[]) => void
} = {}): {
    ws: WebSocket;
    sendList: ServerAction[];
    receive: (...actionList: ClientAction[]) => Promise<void[]>;
    close: () => void;
} => {
    const ws = new WebSocket('');

    const sendList: ServerAction[] = [];

    const _send = ws.send.bind(ws);
    ws.send = (...args: any[]) => {

        // mock can fail...
        try {
            (_send as any)(...args);
        } catch (e) { }

        const list = JSON.parse(args[ 0 ]);

        sendList.push(...list);

        if (onSendFn)
            onSendFn()(list);
    };

    let onReceiveListener: (data: WebSocket.Data) => (Promise<void> | void)[];

    let onClose = () => { }

    ws.on = (event: 'message' | 'close' | string, listener: any) => {
        if (event === 'message') {
            onReceiveListener = listener;
        } else if (event === 'close') {
            onClose = listener;
        }
        return ws;
    };

    return {
        ws,
        sendList,
        receive: async (...actionList) => {
            const data = JSON.stringify(actionList);
            return Promise.all(
                onReceiveListener(data).filter(r => r instanceof Promise)
            );
        },
        close: () => onClose()
    };
};
