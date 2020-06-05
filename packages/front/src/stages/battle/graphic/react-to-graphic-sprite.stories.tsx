import { Typography } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { createStoreManager } from '../../../store-manager';
import { UIIcon } from '../../../ui/battle-ui/spell-panel/spell-button/ui-icon';
import { CreatePixiFn, createView } from '../../../view';
import { ReactToGraphicSprite } from './react-to-graphic-sprite';

export default {
    title: 'graphic/React to graphic sprite',
    component: ReactToGraphicSprite
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
            width: 1000,
            height: 100,
            backgroundColor: 0xFFFFFF
        });

        const graphic = new PIXI.Graphics();
        app.stage.addChild(graphic);

        graphic.beginFill(0xFF666622);
        graphic.drawRect(0, 0, 500, 100);
        graphic.endFill();

        const someText = ReactToGraphicSprite(<div>some basic text</div>, 100, 10);

        const muiTypography = ReactToGraphicSprite(<Typography variant='h6'>Mui typography h6</Typography>, 100, 50);
        muiTypography.x = 100;

        const muiIcon = ReactToGraphicSprite(<FavoriteIcon />, 24, 24);
        muiIcon.x = 200;

        const muiUIIcon = ReactToGraphicSprite(<UIIcon icon='life' inPixiContext />, 24, 24, 'color: white');
        muiUIIcon.x = 300;

        app.stage.addChild(someText, muiTypography, muiIcon, muiUIIcon);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};

