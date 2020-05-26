import React from 'react';
import ReactDOM from 'react-dom';
import { Store } from 'redux';
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { ActionManager } from './action/ActionManager';
import { GameAction, IGameAction } from './action/game-action/GameAction';
import { App } from './app';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { GameState } from './game-state';
import { serviceDispatch } from './services/serviceDispatch';
import { WebSocketCreator, WSClient } from './socket/WSClient';
import { StageManager } from './stages/StageManager';
import { roomMiddleware } from './ui/reducers/room-reducers/room-middleware';
import { RootReducer } from './ui/reducers/root-reducer';
import { ReceiveMessageAction } from './socket/wsclient-actions';

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

const reset = (): void => {
    checkEnv();

    const { dispatchReset } = serviceDispatch({
        dispatchReset: (): AppResetAction => ({
            type: 'app/reset'
        })
    });

    dispatchReset();
};

export const Controller = {

    init({ initialState, websocketCreator }: ControllerProps = {}): ControllerStarter {

        checkEnv();

        if (controllerResources) {
            reset();
        }

        const resources: ControllerResources = {};
        controllerResources = resources;

        resources.actionManager = ActionManager();

        const actionManagerMiddleware = getResource('actionManager').getMiddleware();

        const middlewareList = [ roomMiddleware, actionManagerMiddleware ];

        if (process.env.NODE_ENV === 'development') {
            const logger = createLogger({
                collapsed: true,
                actionTransformer: (action: GameAction) => {
                    switch (action.type) {
                        case 'battle/state/event':
                            action.type += ' > ' + action.eventType;
                            break;
                        case 'message/send':
                            action.type += ' > ' + action.message.type;
                            break;
                        case ReceiveMessageAction.type:
                            action.type += ' > ' + action.payload.type;
                            break;
                    }
                    return action;
                }
            });

            middlewareList.push(logger);
        }

        resources.store = configureStore({
            reducer: RootReducer,
            middleware: [...getDefaultMiddleware(), ...middlewareList],
            preloadedState: initialState
        });

        resources.client = WSClient(websocketCreator && { websocketCreator });
        resources.loader = AssetLoader();

        return {
            start(container: Element): Promise<void> {

                return new Promise(resolve => {

                    ReactDOM.render(
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
};
