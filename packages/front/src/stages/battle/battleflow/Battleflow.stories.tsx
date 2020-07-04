import { createPosition, normalize } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { GameState } from '../../../game-state';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { createStoreManager } from '../../../store/store-manager';
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
                id: 'c1', playerId: 'p1', position: createPosition(4, 3),
                features: {
                    life: 100,
                    actionTime: 30000
                },
                staticData: {
                    id: 'c1',
                    name: 'toto',
                    role: 'vemo',
                    description: 'description toto',
                    defaultSpellId: 's1',
                    initialFeatures: {
                        life: 100,
                        actionTime: 30000
                    },
                    staticSpells: []
                }
            }),
            seedCharacterSnapshot({
                id: 'c2', playerId: 'p2', position: createPosition(6, 4),
                features: {
                    life: 120,
                    actionTime: 25000
                },
                staticData: {
                    id: 'c2',
                    name: 'africa',
                    role: 'sampleChar2',
                    description: 'description africa',
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
                    duration: 1000,
                    rangeArea: -1
                }
            }),
            seedSpellSnapshot({
                id: 's2',
                type: 'simpleAttack',
                characterId: 'c1',
                index: 2,
                feature: {
                    duration: 1000,
                    lineOfSight: true,
                    rangeArea: 8,
                    actionArea: 1,
                    attack: 20
                }
            }),
            seedSpellSnapshot({
                id: 's-switch',
                type: 'switch',
                characterId: 'c1',
                index: 3,
                feature: {
                    duration: 2000,
                    lineOfSight: true,
                    rangeArea: 2,
                    actionArea: 0
                }
            }),
            seedSpellSnapshot({
                id: 's3',
                type: 'move',
                characterId: 'c2',
                index: 1,
                feature: {
                    duration: 600,
                    rangeArea: -1
                }
            }),
            seedSpellSnapshot({
                id: 's4',
                type: 'simpleAttack',
                characterId: 'c2',
                index: 1,
                feature: {
                    duration: 1500,
                    rangeArea: 5,
                    actionArea: 1,
                    attack: 40
                }
            }),
        ]

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const startTime = Date.now() + 1000;

        storeManager.dispatch(BattleStartAction({
            myPlayerId: 'p1',
            tiledMapAssets: {
                schema: map.schema,
                imagesUrls: map.images
            },
            globalTurnSnapshot: {
                id: 1,
                order: [ 'c1', 'c2' ],
                startTime,
                currentTurn: {
                    id: 1,
                    characterId: 'c1',
                    duration: 30000,
                    startTime
                }
            },
            teamSnapshotList: [ t1, t2 ],
            playerSnapshotList: [ p1, p2 ],
            entitiesSnapshot: {
                battleHash: '',
                charactersSnapshots: characterList,
                launchTime: startTime,
                spellsSnapshots: spellList,
                time: startTime
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
    });

    const notifyFn = () => {

        const { position } = storeManager.getState().battle.snapshotState.battleDataCurrent.characters.c2;

        const newPosition = createPosition(position.x + 1, position.y);

        storeManager.dispatch(ReceiveMessageAction({
            type: 'notify',
            sendTime: -1,
            spellActionSnapshot: {
                spellId: 's3',
                characterId: 'c2',
                actionArea: normalize([ newPosition ]),
                position: newPosition,
                startTime: Date.now() - 100,
                duration: 600,
                battleHash: ''
            }
        }))
    };

    return <>
        {view}

        <div style={{ position: 'absolute', top: 0, right: 0 }}>

            <button onClick={notifyFn}>notify</button>

        </div>
    </>;
};
