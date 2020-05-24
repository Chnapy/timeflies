import { Position, TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { StoryProps } from '../../../../../.storybook/preview';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { BattleDataPeriod } from '../../../../BattleData';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { Controller } from '../../../../Controller';
import { seedCharacter } from '../../entities/character/Character.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedTeam } from '../../entities/team/Team.seed';
import { MapManager } from '../../map/MapManager';
import { Pathfinder } from '../../map/Pathfinder';
import { TiledMapGraphic } from '../tiledMap/TiledMapGraphic';
import { CharactersBoard } from './CharactersBoard';
import { seedBattleData } from '../../../../battle-data.seed';
import { seedGameState } from '../../../../game-state.seed';

export default {
    title: 'graphic/CharactersBoard',
    component: CharactersBoard
};

const createCharacter = <P extends BattleDataPeriod>(id: string, period: P, position: Position) => seedCharacter('real', {
    period,
    id,
    player: seedPlayer('fake', {
        id: 'p' + id, period, team: seedTeam('fake', {
            id: 't' + id, period, seedPlayers: []
        })
    }),
    position,
    orientation: 'right'
});

const Render: React.FC<StoryProps & { period: BattleDataPeriod }> = ({ fakeBattleApi: fakeApi, period }) => {

    const characters = [
        createCharacter('1', period, {x: 2, y: 3}),
        createCharacter('2', period, {x: 4, y: 2}),
    ];

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({
            [ period ]: {
                characters
            }
        })
    });

    fakeApi.init({
        initialState
    });

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = Controller.loader;

        const resources = await loader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const sheet = resources.characters.spritesheet;

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, {
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
