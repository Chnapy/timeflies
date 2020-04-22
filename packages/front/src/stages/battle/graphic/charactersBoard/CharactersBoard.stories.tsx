import { TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { StoryProps } from '../../../../../.storybook/preview';
import { BattleDataPeriod } from '../../../../BattleData';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { Controller } from '../../../../Controller';
import { GameState } from '../../../../game-state';
import mapPath from '../../../../_assets/map/map.json';
import charactersSpritesheetPath from '../../../../_assets/spritesheets/sokoban.json';
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

const Render: React.FC<StoryProps & { period: BattleDataPeriod }> = ({ fakeBattleApi: fakeApi, period }) => {

    const characters = [
        seedCharacter('real', {
            period,
            id: '1',
            player: null,
            position: { x: 2, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            period,
            id: '2',
            player: null,
            position: { x: 4, y: 2 },
            orientation: 'left'
        }),
    ];

    const initialState: GameState = {
        currentPlayer: null,
        load: null,
        room: null,
        step: 'battle',
        battle: {
            [ period ]: {
                characters
            }
        } as any
    };

    fakeApi.init({
        initialState
    });

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = Controller.loader;

        const resources = await loader.newInstance()
            .add('map', mapPath)
            .addSpritesheet('characters', charactersSpritesheetPath)
            .load();

        const sheet = resources.characters;

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

export const Current: React.FC<StoryProps> = (props) => <Render {...props} period='current' />;

export const Future: React.FC<StoryProps> = (props) => <Render {...props} period='future' />;
