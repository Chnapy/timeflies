import { Store } from 'redux';
import { ActionManager } from './action/ActionManager';
import { GameAction } from "./action/GameAction";
import { AssetLoader } from './assetManager/AssetLoader';
import { WebSocketCreator } from './socket/WSClient';
import { UIState } from './ui/UIState';

export interface IController {

    start(websocketCreator?: WebSocketCreator): void;
    getStore(): Store<UIState, GameAction>;

    waitConnect(): Promise<void>;
    readonly actionManager: ActionManager;
    readonly loader: AssetLoader;
}
