import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../game-state';
import { createStoreManager } from '../../../../../store-manager';
import { battleReducer } from '../../../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../../../view';
import { BattleStartAction } from '../../../battle-actions';
import { characterToSnapshot } from '../../../entities/character/Character';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { playerToSnapshot } from '../../../entities/player/Player';
import { seedPlayer } from '../../../entities/player/Player.seed';
import { teamToSnapshot } from '../../../entities/team/Team';
import { seedTeam } from '../../../entities/team/Team.seed';
import { BattleDataPeriod } from '../../../snapshot/battle-data';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterGraphic } from './CharacterGraphic';

export default {
    title: 'graphic/CharacterGraphic',
    component: CharacterGraphic
};

export const Current: React.FC = () => {

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

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

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
            teamSnapshotList: [ teamToSnapshot(team) ],
            playerSnapshotList: [ playerToSnapshot(player) ],
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: [ characterToSnapshot(character) ],
                launchTime: Date.now(),
                spellsSnapshots: [],
                time: Date.now()
            }
        }));

        const hud = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => CharacterGraphic(character.id, period));
        app.stage.addChild(hud.container);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};

export const Future: React.FC = () => {

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

        const period: BattleDataPeriod = 'future';

        const team = seedTeam({
            id: 't1'
        });

        const player = seedPlayer({
            id: 'p1', teamId: 't1'
        });

        const character = seedCharacter({
            id: 'c1', period, playerId: 'p1'
        });

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

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
            teamSnapshotList: [ teamToSnapshot(team) ],
            playerSnapshotList: [ playerToSnapshot(player) ],
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: [ characterToSnapshot(character) ],
                launchTime: Date.now(),
                spellsSnapshots: [],
                time: Date.now()
            }
        }));

        const hud = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => CharacterGraphic(character.id, period));
        app.stage.addChild(hud.container);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    return view;
};
