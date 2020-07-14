
export type WaitTimeoutPromiseState = 'wait' | 'completed' | 'canceled';

export type WaitTimeoutPromisePayload = Extract<WaitTimeoutPromiseState, 'completed' | 'canceled'>;

export type WaitTimeoutPromise<T = WaitTimeoutPromisePayload> = Omit<Promise<T>, 'then' | 'catch'> & {

    onCompleted<R>(fn: () => R | PromiseLike<R>): WaitTimeoutPromise<R | Exclude<WaitTimeoutPromisePayload, 'completed'>>;

    onCanceled<R>(fn: () => R | PromiseLike<R>): WaitTimeoutPromise<R | Exclude<WaitTimeoutPromisePayload, 'canceled'>>;

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): WaitTimeoutPromise<TResult1 | TResult2>;

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): WaitTimeoutPromise<T | TResult>;

    getState: () => WaitTimeoutPromiseState;

    /**
     * Cancel promise.
     * promise.then is called with 'canceled' payload value.
     * 
     * If already completed/canceled it does nothing.
     */
    cancel: () => void;
};

/**
 * Create a pool that handle waitTimeouts, for promise-based timeouts that can be canceled.
 */
export const createWaitTimeoutPool = () => {

    let isEnabled = true;

    const pool: WaitTimeoutPromise<unknown>[] = [];

    const setPoolEnable = (enable: boolean) => isEnabled = enable;

    const createTimeout: typeof waitTimeout = ms => {

        if (isEnabled) {
            const timeout = waitTimeout(ms)
                .then(state => {
                    const indexToRemove = pool.indexOf(timeout);
                    pool.splice(indexToRemove, 1);

                    return state;
                });

            pool.push(timeout);

            return timeout;
        }

        return canceledWaitTimeout();
    };

    const clearAll = () => {
        pool.forEach(t => t.cancel());

        return Promise.all(pool);
    };

    const getAll = (): readonly WaitTimeoutPromise<unknown>[] => pool;

    return {

        /**
         * If defined to false, createTimeout returns canceled timeouts.
         * For testing purpose (avoid unexpected timeouts).
         */
        setPoolEnable,

        /**
         * Return a promise-based timeout that can be canceled.
         */
        createTimeout,

        /**
         * Cancel all current timeouts
         */
        clearAll,

        /**
         * Return all current timeouts (not completed/canceled)
         */
        getAll
    };
};

const canceledWaitTimeout = () => {
    const timeout = waitTimeout(Infinity);
    timeout.cancel();
    return timeout;
};

/**
 * Return a promise-based timeout that can be canceled.
 * 
 * @param ms delay before promise complete (if not canceled before)
 */
const waitTimeout = (ms: number): WaitTimeoutPromise => {

    let state: WaitTimeoutPromiseState = 'wait';
    let timeout: NodeJS.Timeout;
    let cancel: WaitTimeoutPromise[ 'cancel' ];

    const promise = new Promise<WaitTimeoutPromisePayload>(r => {

        timeout = setTimeout(() => {
            state = 'completed';
            r(state);
        }, ms);

        cancel = () => {
            if (state === 'wait' && timeout) {
                clearTimeout(timeout);

                state = 'canceled';
                r(state);
            }
        };
    });

    const getState: WaitTimeoutPromise[ 'getState' ] = () => state;

    const transformPromise = <T>(p: Promise<T>): WaitTimeoutPromise<T> => {

        const _then = p.then.bind(p);
        const _catch = p.catch.bind(p);

        const thenFn: WaitTimeoutPromise<T>[ 'then' ] = (...args) => {
            const thenPromise = _then(...args);

            return transformPromise(thenPromise) as any;
        };

        const catchFn: WaitTimeoutPromise<T>[ 'catch' ] = (...args) => {
            const catchPromise = _catch(...args);

            return transformPromise(catchPromise);
        };

        const onCompleted: WaitTimeoutPromise<T>[ 'onCompleted' ] = fn => {
            const completePromise = promise.then(_state => {

                if (_state === 'completed') {
                    return fn();
                }

                return _state;
            });

            return transformPromise(completePromise);
        };

        const onCanceled: WaitTimeoutPromise<T>[ 'onCanceled' ] = fn => {
            const canceledPromise = promise.then(_state => {

                if (_state === 'canceled') {
                    return fn();
                }

                return _state;
            });

            return transformPromise(canceledPromise);
        };

        return Object.assign(p, {
            onCompleted,
            onCanceled,
            then: thenFn,
            catch: catchFn,
            getState,
            cancel: () => cancel()
        });
    };

    return transformPromise(promise);
};
