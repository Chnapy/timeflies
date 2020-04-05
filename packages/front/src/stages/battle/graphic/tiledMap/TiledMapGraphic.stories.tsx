import * as PIXI from 'pixi.js';
import React from 'react';
import { TiledMapGraphic } from './TiledMapGraphic';
import { Controller } from '../../../../Controller';
import { TiledManager, SpellType } from '@timeflies/shared';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { AssetLoader } from '../../../../assetManager/AssetLoader';
import { serviceDispatch } from '../../../../services/serviceDispatch';
import { SpellEngineBindAction } from '../../engine/Engine';

export default {
    title: 'graphic/TiledMapGraphic'
};

export const Default = () => {
    Controller.reset();

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = AssetLoader();

        const { map } = await loader.newInstance()
            .add('map', 'http://127.0.0.1:8887/map.json')
            .load();

        const tiledManager = TiledManager(map, {
            defaultTilelayerName: 'view',
            obstacleTilelayerName: 'obstacles'
        });

        CanvasContext.provider({
            mapManager: {
                tiledManager
            } as any
        }, TiledMapGraphic);

        const tiledMap = CanvasContext.provider({
            mapManager: {
                tiledManager
            } as any
        }, TiledMapGraphic);
        app.stage.addChild(tiledMap.container);

        const { dispatchBindAction } = serviceDispatch({
            dispatchBindAction: (spellType: SpellType): SpellEngineBindAction => ({
                type: 'battle/spell-engine/bind',
                spellType,
                onTileHover: async () => {
                    return;
                },
                onTileClick: async () => { },
            })
        });

        dispatchBindAction('move');
    };

    return <div ref={el => el && onMount(el)} style={{
        overflow: 'hidden',
        position: 'absolute',
        top: 8,
        bottom: 8,
        left: 0,
        right: 0
    }}>
        <canvas />
    </div>;
};
