import React from 'react';
import { App } from './app';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { StoreManager } from './store-manager';

type ViewProps = {
    storeManager: StoreManager;
    assetLoader: AssetLoader;
};

export const createView = ({ storeManager, assetLoader }: ViewProps) => {
    return React.createElement(App, {
        store: storeManager.store,
        assetLoader,
        onMount: (gameWrapper: HTMLElement, canvas: HTMLCanvasElement): void => {

            const gameCanvas = GameCanvas(
                canvas,
                gameWrapper,
                storeManager,
                assetLoader
            );
        }
    });
};
