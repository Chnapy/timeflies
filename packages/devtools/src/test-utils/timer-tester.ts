
const nbrPromiseExpectedPerTest = 1000;

/**
 * Mock Date.now by changing its return value when jest timer functions are used.
 * Simulate time change.
 */
const createTimerTester = () => {
    const oldNowFn = Date.now;

    let spyInstance: jest.SpyInstance | undefined;

    let now: number | undefined;

    const getNow = () => {
        if (!now) {
            now = oldNowFn();
        }
        return now;
    };

    const triggerPromises = () => new Promise<void>(resolve => {
        const recursiveImmediates = (callback: () => void, i: number = 0) => {
            return setImmediate(() => {
                if (i < nbrPromiseExpectedPerTest) {
                    recursiveImmediates(callback, i + 1);
                } else {
                    callback();
                }
            });
        };

        jest.advanceTimersByTime(0);
        recursiveImmediates(resolve);
    });

    const advance = async (ms: number) => {
        now = getNow() + ms;
        jest.advanceTimersByTime(ms);
        await triggerPromises();
    };

    return {
        now: getNow,

        /**
         * Advance time with fake timer, handling promised based timeouts.
         * One setImmediate should be launched for each expected promise.
         */
        advance: async (ms: number, { runJustBeforeItEnds }: { runJustBeforeItEnds?: () => void } = {}) => {
            if (runJustBeforeItEnds) {
                await advance(ms - 50);
                runJustBeforeItEnds();
                await advance(50);
            } else {
                return advance(ms);
            }
        },

        waitTimer: async (promise: unknown) => {
            for (let i = 0; i < 3; i++) {
                await advance(Infinity);
                await triggerPromises();
            }
            return promise;
        },

        endTimer: async (...promises: unknown[]) => {
            jest.runAllTimers();
            await Promise.all(promises);
        },

        triggerPromises,

        beforeTest: () => {
            jest.useFakeTimers();
            spyInstance = jest.spyOn(Date, 'now').mockImplementation(getNow);
        },

        afterTest: () => {
            jest.clearAllTimers();
            jest.useRealTimers();
            spyInstance?.mockRestore();
            spyInstance = undefined;
            now = undefined;
        }
    };
};

export const timerTester = createTimerTester();
