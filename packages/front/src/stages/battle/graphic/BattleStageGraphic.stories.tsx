import { TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import { Controller } from '../../../Controller';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { GameState } from '../../../game-state';
import { SpellEngineBindAction } from '../engine/Engine';
import { SpellPrepareMove } from '../engine/spellEngine/move/SpellPrepareMove';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { MapManager } from '../map/MapManager';
import { Pathfinder as Pathfinder_ } from '../map/Pathfinder';
import { BattleStageGraphic } from './BattleStageGraphic';
import { AssetManager } from '../../../assetManager/AssetManager';

export default {
    title: 'graphic/BattleStageGraphic',
    component: BattleStageGraphic
}

export const Default: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    const charactersCurrent = [
        seedCharacter('real', {
            period: 'current',
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            period: 'current',
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const charactersFuture = [
        seedCharacter('real', {
            period: 'future',
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            period: 'future',
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const initialState: GameState = {
        currentPlayer: null,
        room: null,
        step: 'battle',
        battle: {
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
    };

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

        const charactersSheet = resources.characters;

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder_,
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

export const Pathfinder: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    const charactersCurrent = [
        seedCharacter('real', {
            period: 'current',
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            period: 'current',
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const charactersFuture = [
        seedCharacter('real', {
            period: 'future',
            id: '1',
            player: null,
            position: { x: 4, y: 3 },
            orientation: 'right'
        }),
        seedCharacter('real', {
            period: 'future',
            id: '2',
            player: null,
            position: { x: 6, y: 4 },
            orientation: 'left'
        }),
    ];

    const initialState: GameState = {
        currentPlayer: null,
        room: null,
        step: 'battle',
        battle: {
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
    };

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

        const charactersSheet = resources.characters;

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, {
            getFutureCharacters: () => charactersFuture,
            pathfinderCreator: Pathfinder_,
            tiledManagerCreator: TiledManager
        });

        const spell = seedSpell('fake', {
            period: 'future',
            id: '1',
            type: 'move',
            character: charactersFuture[ 0 ],
        });

        const tiledMapManager = TiledManager(mapAssets);

        const spellPrepareEngine = SpellPrepareMove(spell, mapManager);

        const battleStageGraphic = BattleStageGraphic(app.renderer);

        battleStageGraphic.onCreate({
            mapManager,
            spritesheets: {
                characters: charactersSheet
            }
        });

        app.stage.addChild(battleStageGraphic.getContainer());

        const { dispatchBindAction } = serviceDispatch({
            dispatchBindAction: (): SpellEngineBindAction => ({
                type: 'battle/spell-engine/bind',
                spell: seedSpell('fake', {
                    period: 'future', id: '', type: 'move', character: null as any
                }),
                onTileHover: async (tilePos) => {
                    return await spellPrepareEngine.onTileHover(
                        tilePos,
                        tiledMapManager.getTileType(tilePos)
                    );
                },
                onTileClick: async (tilePos) => {
                    return await spellPrepareEngine.onTileClick(
                        tilePos,
                        tiledMapManager.getTileType(tilePos)
                    );
                },
                rangeArea: []
            })
        });

        dispatchBindAction();
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
