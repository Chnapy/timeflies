import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Store } from 'redux';
import ResizeObserver from 'resize-observer-polyfill';
import { GameAction } from './action/GameAction';
import { App } from './App';
import { RootReducer } from './ui/reducers/RootReducer';
import { UIState } from './ui/UIState';
import { WSClient } from './socket/WSClient';
import { IController } from './IController';
import { BStateTurnStartAction, BStateAction } from './stages/battle/battleState/BattleStateSchema';
import { AssetLoader } from './assetManager/AssetLoader';
import { StageManager } from './stages/StageManager';

export interface Controller extends IController {
}

let store: Store<UIState, GameAction>;
let client: WSClient;
// let game: GameEngine;
let app: App;
const loader = AssetLoader();
let stageManager: StageManager;

const onAppMount = (gameWrapper: HTMLElement): void => {

    const ro = new ResizeObserver((entries) => {
        if (!entries.length) {
            return;
        }
        const { width, height } = entries[ 0 ].contentRect;
        // game.resize(width, height);
    });

    ro.observe(gameWrapper);

    stageManager = StageManager();

    // game = new GameEngine(
    //     gameWrapper
    // );
};

export const Controller: Controller = {

    start() {

        store = createStore<UIState, GameAction, any, any>(
            RootReducer
        );

        client = WSClient();

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

    dispatch<A extends GameAction>(action: A): void {

        if (action.type === 'battle/state/event'
            && (action as BStateAction).eventType === 'TURN-START') {

            console.group(
                action.type,
                (action as unknown as BStateTurnStartAction).payload.characterId,
                [ action ]
            );
            console.groupEnd();
        } else {
            console.log(action.type, action);
        }

        // game.emit(action);

        if (!action.onlyGame) {
            store.dispatch(action);
        }
    },

    addEventListener<A extends GameAction>(type: A[ 'type' ], fn: (action: A) => void): void {
        // TODO
    },

    waitConnect() {
        return client.waitConnect();
    },

    loader
};
