import { TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createStore, Store } from 'redux';
import { GameAction } from '../../../action/GameAction';
import { AssetLoader } from '../../../assetManager/AssetLoader';
import { Controller } from '../../../Controller';
import { RootReducer } from '../../../ui/reducers/RootReducer';
import { UIState } from '../../../ui/UIState';
import { seedCharacter } from '../entities/character/Character.seed';
import { MapManager } from '../map/MapManager';
import { Pathfinder } from '../map/Pathfinder';
import { seedTiledConfig } from '../map/TiledMap.seed';
import { BattleStageGraphic } from './BattleStageGraphic';

export default {
    title: 'graphic/BattleStageGraphic',
    component: BattleStageGraphic
}

export const Default = () => {
    Controller.reset();

    const charactersCurrent = [
        seedCharacter('real', {
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const charactersFuture = [
        seedCharacter('real', {
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const initialState: UIState = {
        currentPlayer: null,
        data: {
            state: 'battle',
            battleData: {
                cycle: {
                    launchTime: -1
                },
                current: {
                    characters: charactersCurrent,
                    battleHash: '',
                    players: [],
                    teams: []
                },
                future: {
                    characters: charactersFuture,
                    battleHash: '',
                    players: [],
                    teams: [],
                    spellActionSnapshotList: []
                }
            }
        }
    };

    const store: Store<UIState, GameAction> = createStore<UIState, GameAction, any, any>(
        RootReducer,
        initialState
    );

    (Controller.getStore as any) = () => store;

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = AssetLoader();

        const resources = await loader.newInstance()
            .add('map', 'http://localhost:8887/map.json')
            .addSpritesheet('characters', 'http://localhost:8887/sokoban.json')
            .load();

        console.log(resources)

        const charactersSheet = resources.characters;
        console.log(charactersSheet);

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, seedTiledConfig('map_1'), {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder,
            tiledManagerCreator: TiledManager
        });

        const battleStageGraphic = BattleStageGraphic(app.renderer);

        battleStageGraphic.onCreate({
            mapManager,
            spritesheets: {
                characters: charactersSheet
            }
        });

        app.stage.addChild(battleStageGraphic.getContainer());
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
