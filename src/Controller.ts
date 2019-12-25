import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Reducer, Store, applyMiddleware, combineReducers } from 'redux';
import { GameAction } from './action/GameAction';
import { App } from './App';
import { GameEngine } from './phaser/GameEngine';
import { UIState } from './ui/UIState';
import { composeWithDevTools } from 'redux-devtools-extension';
import { CharacterReducer } from './ui/reducers/CharacterReducer';
import { RootReducer } from './ui/reducers/RootReducer';

export class Controller {

    private static app: App;
    private static game: GameEngine;

    private static store: Store<UIState, GameAction>;

    static start(): Controller {

        Controller.store = createStore<UIState, GameAction, any, any>(
            RootReducer,
            composeWithDevTools(applyMiddleware(
            ))
        );

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
        Controller.game = new GameEngine(
            gameWrapper
        );
    };
}