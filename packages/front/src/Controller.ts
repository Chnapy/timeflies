import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Store } from 'redux';
import ResizeObserver from 'resize-observer-polyfill';
import { GameAction } from './action/GameAction';
import { App } from './App';
import { BattleTurnStartAction } from './phaser/battleReducers/BattleReducerManager';
import { GameEngine } from './phaser/GameEngine';
import { RootReducer } from './ui/reducers/RootReducer';
import { UIState } from './ui/UIState';
import { WSClient } from './socket/WSClient';
import { IController } from './IController';

export interface Controller extends IController {

}

let store: Store<UIState, GameAction>;
let client: WSClient;
let game: GameEngine;
let app: App;

const onAppMount = (gameWrapper: HTMLElement): void => {

    const ro = new ResizeObserver((entries) => {
        if (!entries.length) {
            return;
        }
        const { width, height } = entries[0].contentRect;
        game.resize(width, height);
    });

    ro.observe(gameWrapper);

    game = new GameEngine(
        gameWrapper
    );
};

export const Controller: Controller = {

    start() {

        store = createStore<UIState, GameAction, any, any>(
            RootReducer
        );

        client = new WSClient();

        app = ReactDOM.render(
            React.createElement(App, {
                store,
                onMount: onAppMount
            }),
            document.getElementById('root')
        );
    },

    dispatch<A extends GameAction>(action: A): void {

        if (action.type === 'battle/turn/start') {
            console.group(
                action.type,
                (action as BattleTurnStartAction).character.staticData.name,
                [action]
            );
            console.groupEnd();
        } else {
            console.log(action.type, action);
        }

        game.emit(action);

        if (!action.onlyGame) {
            store.dispatch(action);
        }
    },

    waitConnect() {
        return client.waitConnect();
    }
};
