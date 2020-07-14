import { characterEntityToSnapshot, playerEntityToSnapshot, teamEntityToSnapshot } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../../game-state';
import { createStoreManager } from '../../../../../../store/store-manager';
import { battleReducer } from '../../../../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../../../../view';
import { BattleStartAction } from '../../../../battle-actions';
import { seedCharacter } from '../../../../entities/character/Character.seed';
import { seedPlayer } from '../../../../entities/player/Player.seed';
import { seedTeam } from '../../../../entities/team/Team.seed';
import { BattleDataPeriod } from '../../../../snapshot/battle-data';
import { TiledMapGraphic } from '../../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud';

export default {
    title: 'graphic/CharacterGraphic/Character HUD',
    component: CharacterHud
};

export const Default: React.FC = () => {

    const initialState: GameState = {
        currentPlayer: {
            id: 'p1',
            name: ''
        },
        step: 'battle',
        room: null,
        battle: battleReducer(undefined, { type: '' })
    };

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
        middlewareList: []
    });

    const createPixi: CreatePixiFn = async ({ canvas, parent }) => {
        const app = new PIXI.Application({
            view: canvas,
            resizeTo: parent,
            width: 200,
            height: 200,
            backgroundColor: 0x888888
        });

        const period: BattleDataPeriod = 'current';

        const team = seedTeam({
            id: 't1'
        });

        const player = seedPlayer({
            id: 'p1', teamId: 't1'
        });

        const character = seedCharacter({
            id: 'c1', period, playerId: 'p1'
        });

        const { map } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

        const hud = CanvasContext.provider({ tiledMapGraphic }, () => CharacterHud(character.id));
        hud.container.y = 30;
        app.stage.addChild(hud.container);

        await storeManager.dispatch(BattleStartAction({
            myPlayerId: 'p1',
            tiledMapAssets: {
                schema: map.schema,
                imagesUrls: map.images
            },
            globalTurnSnapshot: {
                id: 1,
                order: [],
                startTime: Date.now(),
                currentTurn: {
                    id: 1,
                    characterId: '1',
                    duration: 0,
                    startTime: Date.now()
                }
            },
            teamSnapshotList: [ teamEntityToSnapshot(team) ],
            playerSnapshotList: [ playerEntityToSnapshot(player) ],
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: [ characterEntityToSnapshot(character) ],
                launchTime: Date.now(),
                spellsSnapshots: [],
                time: Date.now()
            }
        }));
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};
