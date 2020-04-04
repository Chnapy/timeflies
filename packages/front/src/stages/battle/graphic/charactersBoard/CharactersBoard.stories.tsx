import { TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createStore, Store } from 'redux';
import { GameAction } from '../../../../action/GameAction';
import { AssetLoader } from '../../../../assetManager/AssetLoader';
import { BattleDataPeriod } from '../../../../BattleData';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { Controller } from '../../../../Controller';
import { RootReducer } from '../../../../ui/reducers/RootReducer';
import { UIState } from '../../../../ui/UIState';
import { seedCharacter } from '../../entities/character/Character.seed';
import { MapManager } from '../../map/MapManager';
import { Pathfinder } from '../../map/Pathfinder';
import { seedTiledConfig } from '../../map/TiledMap.seed';
import { TiledMapGraphic } from '../tiledMap/TiledMapGraphic';
import { CharactersBoard } from './CharactersBoard';

export default {
    title: 'graphic/CharactersBoard',
    component: CharactersBoard
};

const Render: React.FC<{ period: BattleDataPeriod }> = ({ period }) => {
    Controller.reset();

    const characters = [
        seedCharacter('real', {
            id: '1',
            player: null,
            position: { x: 2, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            id: '2',
            player: null,
            position: { x: 4, y: 2 },
            orientation: 'left'
        }),
    ];

    const initialState: UIState = {
        currentPlayer: null,
        data: {
            state: 'battle',
            battleData: {
                [period]: {
                    characters
                }
            } as any
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

        const sheet = resources.characters;
        console.log(sheet);

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, seedTiledConfig('map_1'), {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder,
            tiledManagerCreator: TiledManager
        });

        const tiledMapGraphic = CanvasContext.provider({
            mapManager
        }, () => TiledMapGraphic());

        const { container } = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: sheet
            }
        }, () => CharactersBoard(period));

        app.stage.addChild(container);
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

export const Current: React.FC = () => <Render period='current'/>;

export const Future: React.FC = () => <Render period='future'/>;
