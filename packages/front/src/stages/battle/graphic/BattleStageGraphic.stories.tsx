import * as PIXI from 'pixi.js';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
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
import { BattleStageGraphic } from './BattleStageGraphic';
import { CanvasContext } from '../../../canvas/CanvasContext';

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
                spellsSnapshots: [],
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
        gameUIChildren: null
    });

    return view;
};

// export const Pathfinder: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

//     const charactersCurrent = [
//         createCharacter('1', 'current', { x: 4, y: 3 }),
//         createCharacter('2', 'current', { x: 6, y: 4 }),
//     ];

//     const charactersFuture = [
//         createCharacter('1', 'future', { x: 4, y: 3 }),
//         createCharacter('2', 'future', { x: 6, y: 4 }),
//     ];

//     const initialState: GameState = {
//         currentPlayer: null,
//         room: null,
//         step: 'battle',
//         battle: {
//             cycle: {
//                 launchTime: -1
//             },
//             current: {
//                 characters: charactersCurrent,
//                 battleHash: '',
//                 players: [],
//                 teams: []
//             },
//             future: {
//                 characters: charactersFuture,
//                 battleHash: '',
//                 players: [],
//                 teams: [],
//                 spellActionSnapshotList: []
//             }
//         }
//     };

//     fakeApi.init({
//         initialState
//     });

//     const onMount = async (parent: HTMLElement) => {
//         const view = parent.firstElementChild as HTMLCanvasElement;
//         const app = new PIXI.Application({ view, resizeTo: parent });

//         const loader = Controller.loader;

//         const resources = await loader.newInstance()
//             .add('map', AssetManager.fake.mapSchema)
//             .addSpritesheet('characters', AssetManager.spritesheets.characters)
//             .load();

//         const charactersSheet = resources.characters.spritesheet;

//         const mapAssets = resources.map;

//         const mapManager = MapManager(mapAssets, {
//             getFutureCharacters: () => charactersFuture,
//             pathfinderCreator: Pathfinder_,
//             tiledManagerCreator: TiledManager
//         });

//         const spell = seedSpell('fake', {
//             period: 'future',
//             id: '1',
//             type: 'move',
//             character: charactersFuture[ 0 ],
//         });

//         const tiledMapManager = TiledManager(mapAssets);

//         const spellPrepareEngine = SpellPrepareMove(spell, mapManager);

//         const battleStageGraphic = BattleStageGraphic(app.renderer);

//         battleStageGraphic.onCreate({
//             mapManager,
//             spritesheets: {
//                 characters: charactersSheet
//             }
//         });

//         app.stage.addChild(battleStageGraphic.getContainer());

//         const { dispatchBindAction } = serviceDispatch({
//             dispatchBindAction: () => SpellEngineBindAction({
//                 spell: seedSpell('fake', {
//                     period: 'future', id: '', type: 'move', character: null as any
//                 }),
//                 onTileHover: async (tilePos) => {
//                     return await spellPrepareEngine.onTileHover(
//                         tilePos,
//                         tiledMapManager.getTileType(tilePos)
//                     );
//                 },
//                 onTileClick: async (tilePos) => {
//                     return await spellPrepareEngine.onTileClick(
//                         tilePos,
//                         tiledMapManager.getTileType(tilePos)
//                     );
//                 },
//                 rangeArea: []
//             })
//         });

//         dispatchBindAction();
//     };

//     return <div ref={el => el && onMount(el)} style={{
//         overflow: 'hidden',
//         position: 'absolute',
//         top: 8,
//         bottom: 8,
//         left: 0,
//         right: 0
//     }}>
//         <canvas />
//     </div>;
// };
