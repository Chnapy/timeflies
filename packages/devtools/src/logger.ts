import colors from 'colors/safe';

type ActionLike = { action: string; payload: unknown; };

type MessageLike = string | ActionLike | object;

type LogInfos = {
    level: 'info' | 'net' | 'warn' | 'error';
    label?: string;
    messages: MessageLike[];
};

const isNodeJsContext = typeof (globalThis as any).window === 'undefined';

const isMessageActionLike = (message: any): message is ActionLike => 'action' in message;

const logFn = ({ level, label, messages }: LogInfos) => {
    const timestamp = new Date().toLocaleString();

    const getLevel = () => {
        switch (level) {
            case 'info': return colors.green(level);
            case 'warn': return colors.yellow(level);
            case 'error': return colors.red(level);
            case 'net': return colors.magenta(level)
        }
    };

    if (isNodeJsContext) {

        const getMessage = (): string => {
            return messages.map(message => {
                if (typeof message === 'string')
                    return message;

                if (isMessageActionLike(message)) {
                    const { action, payload } = message;

                    return `${colors.bold(action)} ${JSON.stringify(payload)}`;
                }

                return JSON.stringify(message);
            }).join(' ');
        };

        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;

        stream.write(`${colors.grey(timestamp)} - ${getLevel()}${label ? `[${label}]` : ''}: ${getMessage()}\n`);
    } else {

        const getMessage = (): unknown[] => {
            return messages.flatMap(message => {
                if (typeof message === 'string')
                    return [ message ];

                if (isMessageActionLike(message)) {
                    const { action, payload } = message;

                    return [ colors.bold(action), payload ];
                }

                return message;
            });
        };

        const stream = console[ level === 'net' ? 'info' : level ];

        stream(`${colors.grey(timestamp)} ${getLevel()}${label ? `[${label}]` : ''}:`, ...getMessage());
    }
};

export const logger = {
    info: (...messages: MessageLike[]) => {
        logFn({
            level: 'info',
            messages
        });
    },
    net: (...messages: MessageLike[]) => {
        logFn({
            level: 'net',
            messages
        });
    },
    error: (err: Error) => {
        if (!(err as any).code || (err as any).code === 500) {
            logFn({
                level: 'error',
                messages: [ err.stack ?? err + '' ]
            });
        } else {
            logFn({
                level: 'warn',
                messages: [ err.stack
                    ? err.stack.split('\n').slice(0, 2).join('\n')
                    : err + '' ]
            });
        }
    },
    logDispatch: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'info',
                messages: [ actionLike ]
            });
        });
    },
    logMessageReceived: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'net',
                label: (colors as any).brightMagenta.bold('in'),
                messages: [ actionLike ]
            });
        });
    },
    logMessageSent: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'net',
                label: (colors.magenta as any).bold('out'),
                messages: [ actionLike ]
            });
        });
    }
};
