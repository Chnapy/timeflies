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
import { seedCharacterSnapshot } from '../entities/character/Character.seed';
import { seedPlayerSnapshot } from '../entities/player/Player.seed';
import { seedSpellSnapshot } from '../entities/spell/Spell.seed';
import { seedTeamSnapshot } from '../entities/team/Team.seed';
import { BattleStageGraphic } from '../graphic/BattleStageGraphic';

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

        const t1 = seedTeamSnapshot({
            id: 't1'
        });
        const t2 = seedTeamSnapshot({
            id: 't2'
        });

        const p1 = seedPlayerSnapshot({
            id: 'p1', teamId: 't1', name: 'chnapy'
        });
        const p2 = seedPlayerSnapshot({
            id: 'p2', teamId: 't2', name: 'yoshi2oeuf'
        });

        const characterList = [
            seedCharacterSnapshot({
                id: 'c1', playerId: 'p1', position: { x: 4, y: 3 },
                staticData: {
                    id: 'c1',
                    name: 'toto',
                    type: 'sampleChar1',
                    defaultSpellId: 's1',
                    initialFeatures: {
                        life: 100,
                        actionTime: 30000
                    },
                    staticSpells: []
                }
            }),
            seedCharacterSnapshot({
                id: 'c2', playerId: 'p2', position: { x: 6, y: 4 },
                staticData: {
                    id: 'c2',
                    name: 'africa',
                    type: 'sampleChar2',
                    defaultSpellId: 's3',
                    initialFeatures: {
                        life: 120,
                        actionTime: 25000
                    },
                    staticSpells: []
                }
            })
        ];

        const spellList = [
            seedSpellSnapshot({
                id: 's1',
                type: 'move',
                characterId: 'c1',
                index: 1,
                feature: {
                    duration: 300
                }
            }),
            seedSpellSnapshot({
                id: 's2',
                type: 'simpleAttack',
                characterId: 'c1',
                index: 2,
                feature: {
                    duration: 1000,
                    area: 8,
                    attack: 20
                }
            }),
            seedSpellSnapshot({
                id: 's3',
                type: 'move',
                characterId: 'c2',
                index: 1,
                feature: {
                    duration: 600
                }
            }),
            seedSpellSnapshot({
                id: 's4',
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
                    characterId: 'c1',
                    duration: 30000,
                    startTime: Date.now()
                }
            },
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: characterList,
                launchTime: Date.now(),
                playersSnapshots: [ p1, p2 ],
                spellsSnapshots: spellList,
                teamsSnapshots: [ t1, t2 ],
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
