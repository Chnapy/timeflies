import { configureStore, getDefaultMiddleware, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { rootReducer } from './root-reducer';

export const createStoreManager = () => {

    const getMiddlewares = () => {
        const middlewares: Middleware[] = [
            ...getDefaultMiddleware()
        ];

        if (process.env.NODE_ENV === 'development') {
            const logger = createLogger({
                collapsed: true
            });

            middlewares.push(logger);
        }

        return middlewares;
    };

    const store = configureStore({
        reducer: rootReducer,
        middleware: getMiddlewares()
    });

    return store;
};
