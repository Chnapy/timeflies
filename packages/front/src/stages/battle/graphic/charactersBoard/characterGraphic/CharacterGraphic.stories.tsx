import { characterEntityToSnapshot, createPosition, playerEntityToSnapshot, Position, seedSpellActionSnapshot, teamEntityToSnapshot } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../../assetManager/AssetManager';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../game-state';
import { createStoreManager } from '../../../../../store/store-manager';
import { battleReducer } from '../../../../../ui/reducers/battle-reducers/battle-reducer';
import { CreatePixiFn, createView } from '../../../../../view';
import { BattleStartAction } from '../../../battle-actions';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedPlayer } from '../../../entities/player/Player.seed';
import { seedTeam } from '../../../entities/team/Team.seed';
import { BattleDataPeriod } from '../../../snapshot/battle-data';
import { TileGrid } from '../../tiledMap/tile-grid';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterGraphic } from './CharacterGraphic';

export default {
    title: 'graphic/CharacterGraphic',
    component: CharacterGraphic
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

    let graphic: CharacterGraphic;

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

        const character = seedCharacter({
            id: 'c1', period, playerId: 'p1', features: { actionTime: 9999999 }
        });

        const { map, characters } = await assetLoader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const tiledMapGraphic = TiledMapGraphic();

        await storeManager.dispatch(BattleStartAction({
            myPlayerId: 'p1',
            tiledMapAssets: {
                schema: map.schema,
                imagesUrls: map.images
            },
            globalTurnSnapshot: {
                id: 1,
                order: [ 'c1' ],
                startTime: Date.now(),
                currentTurn: {
                    id: 1,
                    characterId: 'c1',
                    duration: 999999,
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

        graphic = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: characters.spritesheet
            }
        }, () => CharacterGraphic(character.id, period));

        const grid = TileGrid(map.schema, 0xFFFFFF);

        app.stage.addChild(graphic.container, grid.graphic);
    };

    const view = createView({
        storeManager,
        assetLoader,
        createPixi,
        gameUIChildren: null
    });

    let currentPosition: Position | null = null;

    const getOnButtonClick = (getStartTime: () => number) => () => {
        const { battle } = storeManager.getState();
        const { tiledSchema } = battle.battleActionState;

        if (!currentPosition) {
            currentPosition = battle.snapshotState.battleDataFuture.characters.c1.position;
        }

        const previousPosition = currentPosition;
        currentPosition = createPosition(previousPosition.x + 1, previousPosition.y);

        const position = currentPosition;

        const duration = 1000;

        graphic.debug.onStateChangePeriod({
            state: 'current-spell',
            tiledSchema: tiledSchema!,
            characterPosition: previousPosition,
            spellRole: 'move',
            currentSpellAction: seedSpellActionSnapshot('s1', {
                position,
                startTime: getStartTime(),
                duration
            })
        });

        setTimeout(() => {
            graphic.debug.onStateChangePeriod({
                state: 'no-spell',
                tiledSchema,
                characterPosition: currentPosition!
            });
            graphic.debug.onStateChange({
                tiledSchema,
                position: currentPosition!
            });
        }, duration);
    };

    return <>
        {view}

        {period === 'current' && <div>
            <button onClick={getOnButtonClick(Date.now)}>right</button>

            <button onClick={getOnButtonClick(() => Date.now() - 500)}>right (+500ms)</button>

            <button onClick={getOnButtonClick(() => Date.now() - 2000)}>right (+2000ms)</button>
        </div>}
    </>;
};

export const Current: React.FC = () => <Render period='current' />;

export const Future: React.FC = () => <Render period='future' />;
