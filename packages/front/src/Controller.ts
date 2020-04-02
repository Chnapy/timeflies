import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import { ActionManager } from './action/ActionManager';
import { GameAction, IGameAction } from './action/GameAction';
import { App } from './App';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { IController } from './IController';
import { WSClient } from './socket/WSClient';
import { StageManager } from './stages/StageManager';
import { RootReducer } from './ui/reducers/RootReducer';
import { UIState } from './ui/UIState';
import { serviceDispatch } from './services/serviceDispatch';

if (process.env.NODE_ENV === 'test') {
    throw new Error(`Controller should not be used in 'test' env.`);
}

export interface AppResetAction extends IGameAction<'app/reset'> {
}

const logger = createLogger({
    collapsed: true
});

const store: Store<UIState, GameAction> = createStore<UIState, GameAction, any, any>(
    RootReducer,
    applyMiddleware(logger)
);
let client: WSClient;
let gameCanvas: GameCanvas;
let app: App;
const actionManager = ActionManager(store.dispatch);
let loader: AssetLoader;
let stageManager: StageManager;

const onAppMount = (gameWrapper: HTMLElement, canvas: HTMLCanvasElement): void => {

    gameCanvas = GameCanvas(
        canvas,
        gameWrapper
    );

    stageManager = StageManager();
};

export const Controller: IController = {

    start(container, websocketCreator) {

        loader = AssetLoader();

        client = WSClient(websocketCreator && { websocketCreator });

        if (container) {
            app = ReactDOM.render(
                React.createElement(App, {
                    store,
                    onMount: onAppMount
                }),
                container
            );
        }
    },

    getStore() {
        return store;
    },

    waitConnect() {
        return client.waitConnect();
    },

    actionManager,

    get loader() {
        return loader;
    },

    reset() {
        const { dispatchReset } = serviceDispatch({
            dispatchReset: (): AppResetAction => ({
                type: 'app/reset'
            })
        });

        dispatchReset();
    }
};
