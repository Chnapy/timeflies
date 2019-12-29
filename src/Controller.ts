import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ResizeObserver from 'resize-observer-polyfill';
import { GameAction } from './action/GameAction';
import { App } from './App';
import { GameEngine } from './phaser/GameEngine';
import { RootReducer } from './ui/reducers/RootReducer';
import { UIState } from './ui/UIState';
import * as Colyseus from './mocks/MockColyseus';

const CLIENT_ENDPOINT = 'ws://echo.websocket.org';

export class Controller {

    private static app: App;
    private static game: GameEngine;
    static client: Colyseus.Client;

    private static store: Store<UIState, GameAction>;

    static start(): Controller {

        Controller.store = createStore<UIState, GameAction, any, any>(
            RootReducer,
            composeWithDevTools(applyMiddleware(
            ))
        );

        Controller.client = new Colyseus.Client(CLIENT_ENDPOINT);

        Controller.app = ReactDOM.render(
            React.createElement(App, {
                store: Controller.store,
                onMount: Controller.onAppMount
            }),
            document.getElementById('root')
        );

        return Controller;
    }

    static readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.game.emit(action);

        if (!action.onlyGame) {
            Controller.store.dispatch(action);
        }
    };

    private static readonly onAppMount = (gameWrapper: HTMLElement): void => {

        const ro = new ResizeObserver((entries, observer) => {
            console.log(entries, observer);
            if (!entries.length) {
                return;
            }
            const { width, height } = entries[ 0 ].contentRect;
            Controller.game.resize(width, height);
        });

        ro.observe(gameWrapper);

        Controller.game = new GameEngine(
            gameWrapper
        );
    };
}