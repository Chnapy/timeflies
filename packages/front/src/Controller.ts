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

export class Controller {

    private static app: App;
    static game: GameEngine;
    static client: WSClient;

    private static store: Store<UIState, GameAction>;

    static start(): void {

        Controller.store = createStore<UIState, GameAction, any, any>(
            RootReducer
        );

        Controller.client = new WSClient();

        Controller.app = ReactDOM.render(
            React.createElement(App, {
                store: Controller.store,
                onMount: Controller.onAppMount
            }),
            document.getElementById('root')
        );
    }

    static readonly dispatch = <A extends GameAction>(action: A): void => {

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

        Controller.game.emit(action);

        if (!action.onlyGame) {
            Controller.store.dispatch(action);
        }

    };

    private static readonly onAppMount = (gameWrapper: HTMLElement): void => {

        const ro = new ResizeObserver((entries, observer) => {
            if (!entries.length) {
                return;
            }
            const { width, height } = entries[0].contentRect;
            Controller.game.resize(width, height);
        });

        ro.observe(gameWrapper);

        Controller.game = new GameEngine(
            gameWrapper
        );
    };
}