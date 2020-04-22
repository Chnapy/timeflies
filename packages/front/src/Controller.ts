import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Store } from 'redux';
import { ActionManager } from './action/ActionManager';
import { GameAction, IGameAction } from './action/GameAction';
import { App } from './app';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { serviceDispatch } from './services/serviceDispatch';
import { WSClient, WebSocketCreator } from './socket/WSClient';
import { StageManager } from './stages/StageManager';
import { RootReducer } from './ui/reducers/root-reducer';
import { GameState } from './game-state';

export interface AppResetAction extends IGameAction<'app/reset'> {
}

export interface ControllerProps {
    websocketCreator?: WebSocketCreator;
    initialState?: GameState;
}

export interface ControllerStarter {
    start(container: Element): Promise<void>;
}

interface ControllerResources {
    store?: Store<GameState, GameAction>;
    client?: WSClient;
    gameCanvas?: GameCanvas;
    app?: App;
    actionManager?: ActionManager;
    loader?: AssetLoader;
    stageManager?: StageManager;
}

const checkEnv = () => {
    if (process.env.NODE_ENV === 'test') {
        throw new Error(`Controller should not be used in 'test' env.`);
    }
};

const getResource = <K extends keyof ControllerResources>(key: K): NonNullable<ControllerResources[ K ]> => {

    checkEnv();

    if (!controllerResources || !controllerResources[ key ]) {
        throw new Error(`Controller resource [${key}] not present`);
    }
    return controllerResources[ key ]!;
};

let controllerResources: ControllerResources | null = null;

export const Controller = {

    init({ initialState, websocketCreator }: ControllerProps = {}): ControllerStarter {

        checkEnv();

        if (controllerResources) {
            Controller.reset();
        }

        const resources: ControllerResources = {};
        controllerResources = resources;

        resources.store = createStore<GameState, GameAction, {}, {}>(
            RootReducer,
            initialState
        );
        resources.actionManager = ActionManager(getResource('store').dispatch);

        resources.client = WSClient(websocketCreator && { websocketCreator });
        resources.loader = AssetLoader();

        return {
            start(container: Element): Promise<void> {

                return new Promise(resolve => {

                    resources.app = ReactDOM.render(
                        React.createElement(App, {
                            store: getResource('store'),
                            onMount: (gameWrapper: HTMLElement, canvas: HTMLCanvasElement): void => {

                                resources.gameCanvas = GameCanvas(
                                    canvas,
                                    gameWrapper
                                );

                                resources.stageManager = StageManager();

                                resolve();
                            }
                        }),
                        container
                    );
                });
            }
        };
    },

    getStore(): Store<GameState, GameAction> {
        return getResource('store');
    },

    waitConnect(): Promise<void> {
        return getResource('client').waitConnect();
    },

    get actionManager(): ActionManager {
        return getResource('actionManager');
    },

    get loader(): AssetLoader {
        return getResource('loader');
    },

    reset(): void {
        checkEnv();

        const { dispatchReset } = serviceDispatch({
            dispatchReset: (): AppResetAction => ({
                type: 'app/reset'
            })
        });

        dispatchReset();
    }
};
