import React from 'react';
import { App } from './app';
import { AssetLoader } from './assetManager/AssetLoader';
import { GameCanvas } from './canvas/GameCanvas';
import { StoreManager } from './store-manager';
import { CanvasContext } from './canvas/CanvasContext';

type ViewProps = {
    storeManager: StoreManager;
    assetLoader: AssetLoader;
    gameUIChildren?: React.ReactNode;
    createPixi?: CreatePixiFn;
};

type CreatePixiProps = {
    canvas: HTMLCanvasElement;
    parent: HTMLElement;
    storeManager: StoreManager;
    assetLoader: AssetLoader;
};

export type CreatePixiFn = (props: CreatePixiProps) => Promise<void>;

const defaultCreatePixi: CreatePixiFn = async ({ canvas, parent, storeManager, assetLoader }: CreatePixiProps) => GameCanvas(
    canvas,
    parent,
    storeManager,
    assetLoader
);

export const createView = ({ storeManager, assetLoader, gameUIChildren, createPixi = defaultCreatePixi }: ViewProps) => {
    return React.createElement(App, {
        store: storeManager.store,
        assetLoader,
        onMount: (parent: HTMLElement, canvas: HTMLCanvasElement): void => {

            CanvasContext.provider({
                storeEmitter: storeManager,
                assetLoader
            }, () =>
                createPixi({
                    canvas,
                    parent,
                    storeManager,
                    assetLoader
                })
            );
        }
    },
        gameUIChildren);
};
