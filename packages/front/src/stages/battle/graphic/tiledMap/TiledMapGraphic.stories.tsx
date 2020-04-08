import { SpellType, TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { AssetLoader } from '../../../../assetManager/AssetLoader';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { Controller } from '../../../../Controller';
import { serviceDispatch } from '../../../../services/serviceDispatch';
import mapPath from '../../../../_assets/map/map.json';
import { SpellEngineBindAction } from '../../engine/Engine';
import { TiledMapGraphic } from './TiledMapGraphic';

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
            .add('map', mapPath)
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
                    return undefined;
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
