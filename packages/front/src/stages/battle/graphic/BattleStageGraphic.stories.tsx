import { TiledManager, Position } from '@timeflies/shared';
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
import { seedGameState } from '../../../game-state.seed';
import { seedBattleData } from '../../../battle-data.seed';
import { seedPlayer } from '../entities/player/Player.seed';
import { seedTeam } from '../entities/team/Team.seed';
import { BattleDataPeriod } from '../../../BattleData';

export default {
    title: 'graphic/BattleStageGraphic',
    component: BattleStageGraphic
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

export const Default: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    const charactersCurrent = [
        createCharacter('1', 'current', {x: 4, y: 3}),
        createCharacter('2', 'current', {x: 6, y: 4}),
    ];

    const charactersFuture = [
        createCharacter('1', 'future', {x: 4, y: 3}),
        createCharacter('2', 'future', {x: 6, y: 4}),
    ];

    const initialState: GameState = seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({
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

        const charactersSheet = resources.characters.spritesheet;

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
        createCharacter('1', 'current', {x: 4, y: 3}),
        createCharacter('2', 'current', {x: 6, y: 4}),
    ];

    const charactersFuture = [
        createCharacter('1', 'future', {x: 4, y: 3}),
        createCharacter('2', 'future', {x: 6, y: 4}),
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

        const charactersSheet = resources.characters.spritesheet;

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
