import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { GameEngine } from './phaser/GameEngine';
import { Store, createStore, Reducer, Dispatch } from 'redux';
import { GameAction } from './action/GameAction';
import { UIState } from './ui/UIState';

export class Controller {

    private static app: App;
    private static game: GameEngine;

    private static store: Store<UIState, GameAction>;

    static start(): Controller {

        Controller.store = createStore<UIState, GameAction, any, any>(
            Controller.reducer
        );

        Controller.app = ReactDOM.render(
            React.createElement(App, {
                onMount: Controller.onAppMount
            }),
            document.getElementById('root')
        );

        return Controller;
    }

    static readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.game.emit(action);
        Controller.store.dispatch(action);
    };

    private static readonly reducer: Reducer<UIState, GameAction> = (state, action) => {
        return {};
    };

    private static readonly onAppMount = (gameWrapper: HTMLElement): void => {
        Controller.game = new GameEngine(
            gameWrapper
        );
    };
}