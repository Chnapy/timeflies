import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { GameState } from '../../../../game-state';
import { createStoreManager } from '../../../../store-manager';
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
            id: 't1', period
        });

        const player = seedPlayer({
            id: 'p1', period, teamId: 't1'
        });

        const characterList = [
            seedCharacter({
                id: 'c1', period, playerId: 'p1', position: { x: 2, y: 3 }
            }),
            seedCharacter({
                id: 'c2', period, playerId: 'p1', position: { x: 4, y: 2 }
            })
        ];

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

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
                charactersSnapshots: characterList.map(characterToSnapshot),
                launchTime: Date.now(),
                playersSnapshots: [ playerToSnapshot(player) ],
                spellsSnapshots: [],
                teamsSnapshots: [ teamToSnapshot(team) ],
                time: Date.now()
            }
        }));

        const hud = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => CharactersBoard(period));
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

export const Current: React.FC = () => <Render period='current' />;

export const Future: React.FC = () => <Render period='future' />;
