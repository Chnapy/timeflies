import { WaitTimeoutPromiseState, WaitTimeoutPromisePayload, createWaitTimeoutPool, WaitTimeoutPromise } from './wait-timeout';

describe('# wait-timeout', () => {

    jest.useFakeTimers();

    const globalPool = createWaitTimeoutPool();

    const waitTimeout = globalPool.createTimeout;

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should complete promise after given timeout', async () => {
        const fn = jest.fn();

        const promise = waitTimeout(1000)
            .then(fn);

        jest.advanceTimersByTime(900);

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);

        await promise;

        expect(fn).toHaveBeenNthCalledWith<[ WaitTimeoutPromisePayload ]>(1, 'completed');
    });

    it('should cancel promise on cancel function call', async () => {
        const fn = jest.fn();

        const promise = waitTimeout(1000)
            .then(fn);

        jest.advanceTimersByTime(500);

        promise.cancel();

        await promise;

        expect(fn).toHaveBeenNthCalledWith<[ WaitTimeoutPromisePayload ]>(1, 'canceled');
    });

    it('should chain then functions with same structure', async () => {

        const fn1 = jest.fn();
        const fn2 = jest.fn();
        const fn3 = jest.fn();

        const promise = waitTimeout(1000)
            .then(fn1)
            .onCompleted(fn2)
            .then(fn3);

        expect(promise).toHaveProperty<keyof WaitTimeoutPromise>('getState');
        expect(promise).toHaveProperty<keyof WaitTimeoutPromise>('cancel');
        expect(promise).toHaveProperty<keyof WaitTimeoutPromise>('onCanceled');
        expect(promise).toHaveProperty<keyof WaitTimeoutPromise>('onCompleted');

        jest.runOnlyPendingTimers();

        await promise;

        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
        expect(fn3).toHaveBeenCalledTimes(1);
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

    describe('onCompleted', () => {

        it('should run callback on timeout complete', async () => {
            const fn = jest.fn();

            const promise = waitTimeout(1000)
                .onCompleted(fn);

            jest.advanceTimersByTime(900);

            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(200);

            await promise;

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should not run callback on timeout cancel', async () => {
            const fn = jest.fn();

            const promise = waitTimeout(1000)
                .onCompleted(fn);

            jest.advanceTimersByTime(500);

            promise.cancel();

            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('onCanceled', () => {

        it('should run callback on timeout cancel', async () => {
            const fn = jest.fn();

            const promise = waitTimeout(1000)
                .onCanceled(fn);

            jest.advanceTimersByTime(500);

            promise.cancel();

            await promise;

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should not run callback on timeout complete', async () => {
            const fn = jest.fn();

            const promise = waitTimeout(1000)
                .onCanceled(fn);

            jest.advanceTimersByTime(900);

            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(200);

            await promise;

            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('getState', () => {

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

    describe('createWaitTimeoutPool', () => {

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

            await pool.clearAll();

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
