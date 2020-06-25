import { Action, configureStore, getDefaultMiddleware, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { AssetLoader } from '../assetManager/AssetLoader';
import { GameState } from '../game-state';
import { ReceiveMessageAction, SendMessageAction } from '../socket/wsclient-actions';
import { wsClientMiddleware } from '../socket/wsclient-middleware';
import { getBattleMiddlewareList } from '../ui/reducers/battle-reducers/battle-middleware-list';
import { roomMiddleware } from '../ui/reducers/room-reducers/room-middleware';
import { rootReducer } from '../ui/reducers/root-reducer';
import { bootMiddleware } from '../stages/boot/boot-middleware';
import { CanvasContext } from '../canvas/CanvasContext';
import { batchReducer } from './batch-reducer';
import { batchMiddleware, BatchActions } from './batch-middleware';

export type StoreManager = ReturnType<typeof createStoreManager>;

export type StoreEmitter = Pick<StoreManager, 'onStateChange' | 'getState' | 'dispatch'>;

type Props = {
    assetLoader: AssetLoader;
    initialState?: GameState;
    middlewareList?: Middleware[];
};

const defaultMiddlewareList = (assetLoader: AssetLoader): Middleware[] => [
    bootMiddleware,
    wsClientMiddleware({}),
    roomMiddleware({
        assetLoader
    }),
    ...getBattleMiddlewareList()
];

export const getFullStoreMiddlewareList = (assetLoader: AssetLoader, middlewareList: Middleware[] = defaultMiddlewareList(assetLoader)) => {

    middlewareList.push(
        batchMiddleware
    );

    if (process.env.NODE_ENV === 'development') {
        const logger = createLogger({
            collapsed: true,
            actionTransformer: (action: Action) => {
                if (ReceiveMessageAction.match(action)) {
                    return {
                        ...action,
                        type: action.type + ' > ' + action.payload.type
                    };

                } else if (SendMessageAction.match(action)) {
                    return {
                        ...action,
                        type: action.type + ' > ' + action.payload.type
                    };

                } else if (BatchActions.match(action)) {
                    return {
                        ...action,
                        type: action.type + ' [ ' + action.payload.map(a => a.type).join(' - ') + ' ]'
                    };
                }

                return action;
            }
        });

        middlewareList.push(logger);
    }

    return [
        ...getDefaultMiddleware({
            thunk: false,
            immutableCheck: process.env.NODE_ENV === 'test',
            serializableCheck: process.env.NODE_ENV === 'test'
        }),
        ...middlewareList
    ];
}

export const createStoreManager = ({
    assetLoader,
    initialState,
    middlewareList
}: Props) => {

    const store = configureStore({
        reducer: batchReducer(rootReducer),
        middleware: getFullStoreMiddlewareList(assetLoader, middlewareList),
        preloadedState: initialState
    });

    const onStateChange = <R>(
        selector: (state: GameState) => R,
        onChange: (value: R) => void,
        equalityFn: (a: R, b: R) => boolean = (a, b) => a === b
    ) => {
        let currentState;
        const contextResources = CanvasContext.consumer();

        function handleChange() {
            const nextState = selector(store.getState());
            if (!equalityFn(nextState, currentState)) {
                currentState = nextState;

                CanvasContext.provider(
                    contextResources,
                    () => onChange(currentState)
                );
            }
        }

        const unsubscribe = store.subscribe(handleChange);
        handleChange();
        return unsubscribe;
    };

    return {
        store,
        getState: store.getState,
        dispatch: store.dispatch,
        onStateChange
    };
};
