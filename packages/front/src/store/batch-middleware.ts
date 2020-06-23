import { createAction, AnyAction, Middleware } from '@reduxjs/toolkit';

export const BatchActions = createAction<AnyAction[]>('batch');

/**
 * Should be the last middleware of the list (but before redux-logger !).
 */
export const batchMiddleware: Middleware = api => next => {

    return async action => {

        if (action.meta?.batch) {
            return action;
        }

        if (BatchActions.match(action)) {

            await Promise.all([
                action.payload.map(action => api.dispatch({
                    ...action,
                    meta: { batch: true }
                }))
            ]);
        }

        return next(action);
    };
};
