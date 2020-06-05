import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../../game-state';
import { createStoreManager } from '../../../../../../store-manager';
import { battleReducer } from '../../../../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../../../../view';
import { BattleStartAction } from '../../../../battle-actions';
import { characterToSnapshot } from '../../../../entities/character/Character';
import { seedCharacter } from '../../../../entities/character/Character.seed';
import { playerToSnapshot } from '../../../../entities/player/Player';
import { seedPlayer } from '../../../../entities/player/Player.seed';
import { teamToSnapshot } from '../../../../entities/team/Team';
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
            id: 't1', period
        });

        const player = seedPlayer({
            id: 'p1', period, teamId: 't1'
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

        storeManager.dispatch(BattleStartAction({
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
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: [ characterToSnapshot(character) ],
                launchTime: Date.now(),
                playersSnapshots: [ playerToSnapshot(player) ],
                spellsSnapshots: [],
                teamsSnapshots: [ teamToSnapshot(team) ],
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
