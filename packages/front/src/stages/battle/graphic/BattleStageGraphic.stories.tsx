import { characterEntityToSnapshot, createPosition, playerEntityToSnapshot, teamEntityToSnapshot } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store/store-manager';
import { battleReducer } from '../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../view';
import { BattleStartAction } from '../battle-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedPlayer } from '../entities/player/Player.seed';
import { seedTeam } from '../entities/team/Team.seed';
import { BattleStageGraphic } from './BattleStageGraphic';

export default {
    title: 'graphic/BattleStageGraphic',
    component: BattleStageGraphic
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
            resizeTo: parent
        });

        const period = 'current';

        const team = seedTeam({
            id: 't1'
        });

        const player = seedPlayer({
            id: 'p1', teamId: 't1'
        });

        const characterList = [
            seedCharacter({
                id: 'c1', period, playerId: 'p1', position: createPosition(4, 3)
            }),
            seedCharacter({
                id: 'c2', period, playerId: 'p1', position: createPosition(6, 4)
            })
        ];

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        storeManager.dispatch(BattleStartAction({
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
                charactersSnapshots: characterList.map(characterEntityToSnapshot),
                launchTime: Date.now(),
                spellsSnapshots: [],
                time: Date.now()
            }
        }));

        const battleStageGraphic = CanvasContext.provider({
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => BattleStageGraphic(app.renderer));
        app.stage.addChild(battleStageGraphic.container);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};
