import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../../../assetManager/AssetLoader';
import { createStoreManager } from '../../../../../../store/store-manager';
import { CreatePixiFn, createView } from '../../../../../../view';
import { TeamIndicatorGraphic } from './team-indicator-graphic';

export default {
    title: 'graphic/CharacterGraphic/Team indicator graphic',
    component: TeamIndicatorGraphic
};

export const Default: React.FC = () => {

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        middlewareList: []
    });

    const createPixi: CreatePixiFn = async ({ canvas, parent }) => {
        const app = new PIXI.Application({
            view: canvas,
            resizeTo: parent,
            width: 100,
            height: 100,
            backgroundColor: 0xFFFFFF
        });

        const indicator = TeamIndicatorGraphic('A');
        app.stage.addChild(indicator.container);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};
