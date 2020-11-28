// TODO put this file in @timeflies/common ?

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

    const triggerPromises = () => new Promise(resolve => {
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
        const recursiveImmediates = (callback: () => void, i: number = 0) => {
            return setImmediate(() => {
                if (i < nbrPromiseExpectedPerTest) {
                    recursiveImmediates(callback, i + 1);
                } else {
                    callback();
                }
            });
        };

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

        endTimer: async (...promises: Promise<any>[]) => {
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
