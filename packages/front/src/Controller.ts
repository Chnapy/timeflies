import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import { ActionManager } from './action/ActionManager';
import { GameAction } from './action/GameAction';
import { App } from './App';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { IController } from './IController';
import { WSClient } from './socket/WSClient';
import { StageManager } from './stages/StageManager';
import { RootReducer } from './ui/reducers/RootReducer';
import { UIState } from './ui/UIState';

if (process.env.NODE_ENV === 'test') {
    throw new Error(`Controller should not be used in 'test' env.`);
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
const loader = AssetLoader();
let stageManager: StageManager;

const onAppMount = (gameWrapper: HTMLElement, canvas: HTMLCanvasElement): void => {

    gameCanvas = GameCanvas(
        canvas,
        gameWrapper
    );

    stageManager = StageManager();
};

export const Controller: IController = {

    start(websocketCreator) {

        client = WSClient(websocketCreator && { websocketCreator });

        app = ReactDOM.render(
            React.createElement(App, {
                store,
                onMount: onAppMount
            }),
            document.getElementById('root')
        );
    },

    getStore() {
        return store;
    },

    waitConnect() {
        return client.waitConnect();
    },

    actionManager,

    loader
};
