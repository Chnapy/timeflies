import { WaitTimeoutPromiseState, WaitTimeoutPromisePayload, createWaitTimeoutPool } from './wait-timeout';

describe('# wait-timeout', () => {

    jest.useFakeTimers();

    afterEach(() => {
        jest.clearAllTimers();
    });

    const globalPool = createWaitTimeoutPool();

    const waitTimeout = globalPool.createTimeout;

    it('should complete promise after given timeout', async () => {
        const promise = waitTimeout(1000);

        const fn = jest.fn();

        promise.then(fn);

        jest.advanceTimersByTime(900);

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);

        await promise;

        expect(fn).toHaveBeenNthCalledWith<[ WaitTimeoutPromisePayload ]>(1, 'completed');
    });

    it('should cancel promise on cancel function call', async () => {
        const promise = waitTimeout(1000);

        const fn = jest.fn();

        promise.then(fn);

        jest.advanceTimersByTime(500);

        promise.cancel();

        await promise;

        expect(fn).toHaveBeenNthCalledWith<[ WaitTimeoutPromisePayload ]>(1, 'canceled');
    });

    it('should chain then functions with same structure', async () => {

        const fn1 = jest.fn();
        const fn2 = jest.fn();

        const promise = waitTimeout(1000)
            .then(fn1)
            .then(fn2);

        expect(promise).toHaveProperty('getState');
        expect(promise).toHaveProperty('cancel');

        jest.runOnlyPendingTimers();

        await promise;

        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('should call catch function on error', async () => {

        const fn1 = jest.fn();

        const promise = waitTimeout(1000)
            .then(() => {
                throw new Error();
            })
            .catch(fn1);

        jest.runOnlyPendingTimers();

        await promise;

        expect(fn1).toHaveBeenCalled();
    });

    describe('Timeout state', () => {

        it('should give "wait" state if promise not ended', async () => {
            const promise = waitTimeout(1000);

            expect(promise.getState()).toBe<WaitTimeoutPromiseState>('wait');

            jest.runOnlyPendingTimers();

            await promise;
        });

        it('should give "completed" state if promise completed', async () => {
            const promise = waitTimeout(1000);

            jest.runOnlyPendingTimers();

            await promise;

            expect(promise.getState()).toBe<WaitTimeoutPromiseState>('completed');
        });

        it('should give "canceled" state if promise canceled', async () => {
            const promise = waitTimeout(1000);

            promise.cancel();

            await promise;

            expect(promise.getState()).toBe<WaitTimeoutPromiseState>('canceled');
        });
    });

    describe('Pool', () => {

        it('should add timeout to pool on creation', async () => {
            const pool = createWaitTimeoutPool();

            const p1 = pool.createTimeout(1000);
            const p2 = pool.createTimeout(1000);

            expect(pool.getAll()).toEqual([ p1, p2 ]);
        });

        it('should remove timeout from pool on complete', async () => {
            const pool = createWaitTimeoutPool();

            const p = pool.createTimeout(1000);

            jest.advanceTimersByTime(1100);

            await p;

            expect(pool.getAll()).toEqual([]);
        });

        it('should remove timeout from pool on cancel', async () => {
            const pool = createWaitTimeoutPool();

            const p = pool.createTimeout(1000);

            p.cancel();

            await p;

            expect(pool.getAll()).toEqual([]);
        });

        it('should cancel all timeouts on clear all', async () => {
            const pool = createWaitTimeoutPool();

            const p1 = pool.createTimeout(1000);
            const p2 = pool.createTimeout(1000);

            pool.clearAll();

            await p1;
            await p2;

            expect(p1.getState()).toBe<WaitTimeoutPromiseState>('canceled');
            expect(p2.getState()).toBe<WaitTimeoutPromiseState>('canceled');

            expect(pool.getAll()).toEqual([]);
        });

        it('should create immediate timeout after disable pool', async () => {
            const pool = createWaitTimeoutPool();

            const p1 = pool.createTimeout(1000);

            pool.setPoolEnable(false);

            const p2 = pool.createTimeout(1000);

            expect(p1.getState()).toBe<WaitTimeoutPromiseState>('wait');
            expect(p2.getState()).toBe<WaitTimeoutPromiseState>('canceled');

            expect(pool.getAll()).toEqual([ p1 ]);
        });
    });
});
