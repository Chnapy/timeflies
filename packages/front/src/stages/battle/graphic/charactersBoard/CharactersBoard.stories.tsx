import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { GameState } from '../../../../game-state';
import { createStoreManager } from '../../../../store/store-manager';
import { battleReducer } from '../../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../../view';
import { BattleStartAction } from '../../battle-actions';
import { characterToSnapshot } from '../../entities/character/Character';
import { seedCharacter } from '../../entities/character/Character.seed';
import { playerToSnapshot } from '../../entities/player/Player';
import { seedPlayer } from '../../entities/player/Player.seed';
import { teamToSnapshot } from '../../entities/team/Team';
import { seedTeam } from '../../entities/team/Team.seed';
import { BattleDataPeriod } from '../../snapshot/battle-data';
import { TiledMapGraphic } from '../tiledMap/TiledMapGraphic';
import { CharactersBoard } from './CharactersBoard';
import { createPosition } from '@timeflies/shared';

export default {
    title: 'graphic/CharactersBoard',
    component: CharactersBoard
};

const Render: React.FC<{ period: BattleDataPeriod }> = ({ period }) => {

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

        const team = seedTeam({
            id: 't1'
        });

        const player = seedPlayer({
            id: 'p1', teamId: 't1'
        });

        const characterList = [
            seedCharacter({
                id: 'c1', period, playerId: 'p1', position: createPosition(2, 3)
            }),
            seedCharacter({
                id: 'c2', period, playerId: 'p1', position: createPosition(4, 2)
            })
        ];

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

        const hud = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => CharactersBoard(period));
        app.stage.addChild(hud.container);

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
            playerSnapshotList: [ playerToSnapshot(player) ],
            teamSnapshotList: [ teamToSnapshot(team) ],
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: characterList.map(characterToSnapshot),
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

export const Current: React.FC = () => <Render period='current' />;

export const Future: React.FC = () => <Render period='future' />;
