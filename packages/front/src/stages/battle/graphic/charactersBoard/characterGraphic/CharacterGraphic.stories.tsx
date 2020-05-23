import { Orientation, Position, switchUtil, TiledManager, seedSpellActionSnapshot } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { AssetLoader } from '../../../../../assetManager/AssetLoader';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { serviceDispatch } from '../../../../../services/serviceDispatch';
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { seedSpell } from '../../../entities/spell/Spell.seed';
import { MapManager } from '../../../map/MapManager';
import { Pathfinder } from '../../../map/Pathfinder';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from '../../../spellAction/SpellActionTimer';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterGraphic } from './CharacterGraphic';
import { StoryProps } from '../../../../../../.storybook/preview';
import { AssetManager } from '../../../../../assetManager/AssetManager';
import { seedPlayer } from '../../../entities/player/Player.seed';
import { seedTeam } from '../../../entities/team/Team.seed';
import { seedGameState } from '../../../../../game-state.seed';
import { seedBattleData } from '../../../../../battle-data.seed';

export default {
    title: 'graphic/CharacterGraphic',
    component: CharacterGraphic
};

export const Current: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    fakeApi.init({
        initialState: seedGameState('p1', {
            step: 'battle',
            battle: seedBattleData()
        })
    });

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = AssetLoader();

        const resources = await loader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const sheet = resources.characters.spritesheet;

        const characterCurrent = seedCharacter('fake', {
            id: '1', period: 'current', player: seedPlayer('fake', {
                id: 'p1', period: 'current', team: seedTeam('fake', { id: 't1', letter: 'A', period: 'current', seedPlayers: [] })
            })
        });

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder,
            tiledManagerCreator: TiledManager
        });

        const tiledMapGraphic = CanvasContext.provider({
            mapManager
        }, () => TiledMapGraphic());

        const { container } = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: sheet
            }
        }, () => {
            return CharacterGraphic(characterCurrent);
        });

        app.stage.addChild(container);

        const waitByTime = (ms: number) => new Promise(r => setTimeout(r, ms));

        const { dispatchTimerStart, dispatchTimerEnd } = serviceDispatch({
            dispatchTimerStart: (position: Position, duration: number): SpellActionTimerStartAction => ({
                type: 'battle/spell-action/start',
                spellActionSnapshot: seedSpellActionSnapshot(characterCurrent.defaultSpell.id, {
                    characterId: characterCurrent.id,
                    duration,
                    position,
                    startTime: Date.now(),
                })
            }),
            dispatchTimerEnd: (): SpellActionTimerEndAction => ({
                type: 'battle/spell-action/end',
                correctHash: '',
                removed: false,
                spellActionSnapshot: seedSpellActionSnapshot(characterCurrent.defaultSpell.id, {
                    characterId: characterCurrent.id,
                    position: characterCurrent.position,
                    startTime: Date.now(),
                })
            })
        });

        innerOnClick = async (orientation: Orientation) => {
            const nbrTiles = 1;

            const diffPos = switchUtil(orientation, {
                bottom: {
                    x: 0,
                    y: nbrTiles
                },
                top: {
                    x: 0,
                    y: -nbrTiles
                },
                left: {
                    x: -nbrTiles,
                    y: 0
                },
                right: {
                    x: nbrTiles,
                    y: 0
                }
            });

            const position = {
                x: characterCurrent.position.x + diffPos.x,
                y: characterCurrent.position.y + diffPos.y,
            };

            dispatchTimerStart(position, 500);

            await waitByTime(500);

            characterCurrent.set({
                position,
                orientation
            });

            dispatchTimerEnd();
        };

        innerRollback = () => {
            dispatchTimerEnd();
        };
    };

    let innerOnClick: (o: Orientation) => void = () => { };
    const getOnClick: (o: Orientation) => React.MouseEventHandler = (orientation) => () => {
        innerOnClick(orientation);
    };

    let innerRollback: () => void = () => { };
    const getRollback: () => React.MouseEventHandler = () => () => {
        innerRollback();
    };

    return <div ref={el => el && onMount(el)} style={{
        overflow: 'hidden',
        position: 'absolute',
        top: 8,
        bottom: 8,
        left: 0,
        right: 0
    }}>
        <canvas />
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0
        }}>
            <div>
                <button onClick={getOnClick('top')}>top</button>
                <button onClick={getOnClick('bottom')}>bottom</button>
                <button onClick={getOnClick('left')}>left</button>
                <button onClick={getOnClick('right')}>right</button>
            </div>
            <div>
                <button onClick={getRollback()}>rollback</button>
            </div>
        </div>
    </div>;
};

export const Future: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    fakeApi.init({});

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = AssetLoader();

        const resources = await loader.newInstance()
            .add('map', AssetManager.fake.mapSchema)
            .addSpritesheet('characters', AssetManager.spritesheets.characters)
            .load();

        const sheet = resources.characters.spritesheet;

        const characterFuture = seedCharacter('real', {
            period: 'future',
            id: '1',
            player: null
        });

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder,
            tiledManagerCreator: TiledManager
        });

        const tiledMapGraphic = CanvasContext.provider({
            mapManager
        }, () => TiledMapGraphic());

        const { container } = CanvasContext.provider({
            tiledMapGraphic,
            spritesheets: {
                characters: sheet
            }
        }, () => {
            return CharacterGraphic(characterFuture);
        });

        app.stage.addChild(container);

        const { dispatchSpellLaunch } = serviceDispatch({
            dispatchSpellLaunch: (): BStateSpellLaunchAction => ({
                type: 'battle/state/event',
                eventType: 'SPELL-LAUNCH',
                payload: {
                    spellActions: [ {
                        spell: seedSpell('fake', {
                            period: 'future',
                            id: '1', type: 'move', character: null as any
                        }),
                        position: { x: -1, y: -1 },
                        actionArea: []
                    } ]
                }
            })
        });

        innerOnClick = async (orientation: Orientation) => {
            const nbrTiles = 2;

            const diffPos = switchUtil(orientation, {
                bottom: {
                    x: 0,
                    y: nbrTiles
                },
                top: {
                    x: 0,
                    y: -nbrTiles
                },
                left: {
                    x: -nbrTiles,
                    y: 0
                },
                right: {
                    x: nbrTiles,
                    y: 0
                }
            });

            characterFuture.set({
                position: {
                    x: characterFuture.position.x + diffPos.x,
                    y: characterFuture.position.y + diffPos.y,
                },
                orientation
            });

            dispatchSpellLaunch();
        };
    };

    let innerOnClick: (o: Orientation) => void = () => { };
    const getOnClick: (o: Orientation) => React.MouseEventHandler = (orientation) => () => {
        innerOnClick(orientation);
    };

    return <div ref={el => el && onMount(el)} style={{
        overflow: 'hidden',
        position: 'absolute',
        top: 8,
        bottom: 8,
        left: 0,
        right: 0
    }}>
        <canvas />
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0
        }}>
            <div>
                <button onClick={getOnClick('top')}>top</button>
                <button onClick={getOnClick('bottom')}>bottom</button>
                <button onClick={getOnClick('left')}>left</button>
                <button onClick={getOnClick('right')}>right</button>
            </div>
        </div>
    </div>;
};
