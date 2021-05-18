import colors from 'colors/safe';

type ActionLike = { action: string; payload: unknown; };

type LogInfos = {
    level: 'info' | 'net' | 'warn' | 'error';
    label?: string;
    message: string | ActionLike;
};

const isNodeJsContext = typeof module === 'object';

const logFn = ({ level, label, message }: LogInfos) => {
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
            if (typeof message === 'string')
                return message;

            const { action, payload } = message;

            return `${colors.bold(action)} ${JSON.stringify(payload)}`;
        };

        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;

        stream.write(`${colors.grey(timestamp)} - ${getLevel()}${label ? `[${label}]` : ''}: ${getMessage()}\n`);
    } else {

        const getMessage = (): unknown[] => {
            if (typeof message === 'string')
                return [ message ];

            const { action, payload } = message;

            return [ colors.bold(action), payload ];
        };

        const stream = console[ level === 'net' ? 'info' : level ];

        stream(`${colors.grey(timestamp)} ${getLevel()}${label ? `[${label}]` : ''}:`, ...getMessage());
    }
};

export const logger = {
    error: (err: Error) => {
        if (!(err as any).code || (err as any).code === 500) {
            logFn({
                level: 'error',
                message: err.stack ?? err + ''
            });
        } else {
            logFn({
                level: 'warn',
                message: err.stack
                    ? err.stack.split('\n').slice(0, 2).join('\n')
                    : err + ''
            });
        }
    },
    logDispatch: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'info',
                message: actionLike
            });
        });
    },
    logMessageReceived: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'net',
                label: (colors as any).brightMagenta.bold('in'),
                message: actionLike
            });
        });
    },
    logMessageSent: (actionLikeList: ActionLike[]) => {
        actionLikeList.forEach(actionLike => {
            logFn({
                level: 'net',
                label: (colors.magenta as any).bold('out'),
                message: actionLike
            });
        });
    }
};
