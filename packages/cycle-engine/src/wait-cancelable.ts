import { getDiffFromNow } from './utils';

export type WaitCancelableState = {
    state: 'completed' | 'canceled';
    startTime: number;
    duration: number;
    endTime: number;
    delta: number;
};

export const waitCanceleable = (ms: number) => {
    const startTime = Date.now();

    let enabled = true;
    let duration = ms;
    let resolve: (state: WaitCancelableState) => void;
    let timeout: NodeJS.Timeout;

    const resolveWith = (state: WaitCancelableState[ 'state' ]): void => {
        enabled = false;
        clearTimeout(timeout);

        const endTime = startTime + duration;

        const delta = getDiffFromNow(endTime);

        resolve({
            state,
            startTime,
            duration,
            endTime,
            delta
        });
    };

    const setTime = (newMs: number) => {
        if (!enabled) {
            return;
        }

        clearTimeout(timeout);
        duration = newMs;
        const diff = getDiffFromNow(startTime);
        timeout = setTimeout(() => resolveWith('completed'), duration - diff);
    };

    const getDuration = () => duration;

    const promise = new Promise<WaitCancelableState>(r => {
        resolve = r;
        setTime(ms);
    })
        .finally(() => {
            clearTimeout(timeout);
        });

    const cancel = () => {
        if (!enabled) {
            return;
        }

        clearTimeout(timeout);
        resolveWith('canceled');
    };

    return { promise, cancel, setTime, getDuration };
};
