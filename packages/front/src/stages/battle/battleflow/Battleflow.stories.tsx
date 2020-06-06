import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { GameState } from '../../../game-state';
import { createStoreManager } from '../../../store-manager';
import { battleReducer } from '../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../view';
import { BattleStartAction } from '../battle-actions';
import { characterToSnapshot } from '../entities/character/Character';
import { seedCharacter } from '../entities/character/Character.seed';
import { playerToSnapshot } from '../entities/player/Player';
import { seedPlayer } from '../entities/player/Player.seed';
import { teamToSnapshot } from '../entities/team/Team';
import { seedTeam } from '../entities/team/Team.seed';
import { BattleStageGraphic } from '../graphic/BattleStageGraphic';
import { seedSpell } from '../entities/spell/Spell.seed';
import { spellToSnapshot } from '../entities/spell/Spell';

export default {
    title: 'Battleflow'
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
        initialState
    });

    const createPixi: CreatePixiFn = async ({ canvas, parent }) => {
        const app = new PIXI.Application({
            view: canvas,
            resizeTo: parent
        });

        const period = 'current';

        const team = seedTeam({
            id: 't1', period
        });

        const player = seedPlayer({
            id: 'p1', period, teamId: 't1'
        });

        const characterList = [
            seedCharacter({
                id: 'c1', period, playerId: 'p1', position: { x: 4, y: 3 }
            }),
            seedCharacter({
                id: 'c2', period, playerId: 'p1', position: { x: 6, y: 4 }
            })
        ];

        const spellList = [
            seedSpell({
                id: 's1',
                period,
                type: 'move',
                characterId: 'c1',
                index: 1,
                feature: {
                    duration: 300
                }
            }),
            seedSpell({
                id: 's2',
                period,
                type: 'simpleAttack',
                characterId: 'c1',
                index: 2,
                feature: {
                    duration: 1000,
                    area: 8,
                    attack: 20
                }
            }),
            seedSpell({
                id: 's3',
                period,
                type: 'move',
                characterId: 'c2',
                index: 1,
                feature: {
                    duration: 600
                }
            }),
            seedSpell({
                id: 's4',
                period,
                type: 'simpleAttack',
                characterId: 'c2',
                index: 1,
                feature: {
                    duration: 1500,
                    area: 5,
                    attack: 40
                }
            }),
        ]

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

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
                spellsSnapshots: spellList.map(spellToSnapshot),
                teamsSnapshots: [ teamToSnapshot(team) ],
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
        // gameUIChildren: null
    });

    return view;
};
