import * as PIXI from 'pixi.js';
import React from 'react';
import { AssetLoader } from '../../../../../assetManager/AssetLoader';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { Controller } from '../../../../../Controller';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { MapManager } from '../../../map/MapManager';
import { seedTiledConfig } from '../../../map/TiledMap.seed';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterGraphic } from './CharacterGraphic';
import { TiledManager, Position, Orientation, switchUtil } from '@timeflies/shared';
import { Pathfinder } from '../../../map/Pathfinder';
import { serviceDispatch } from '../../../../../services/serviceDispatch';
import { SpellActionTimerStartAction, SpellActionTimerEndAction } from '../../../spellAction/SpellActionTimer';

export default {
    title: 'graphic/CharacterGraphic',
};

export const Default: React.FC = () => {
    Controller.reset();

    const onMount = async (parent: HTMLElement) => {
        const view = parent.firstElementChild as HTMLCanvasElement;
        const app = new PIXI.Application({ view, resizeTo: parent });

        const loader = AssetLoader();

        const resources = await loader.newInstance()
            .add('map', 'http://localhost:8887/map.json')
            .addSpritesheet('sampleChar1', 'http://localhost:8887/sokoban.json')
            .load();

        console.log(resources)

        const sheet = resources.sampleChar1;
        console.log(sheet);

        const character = seedCharacter('real', { id: '1', player: null });

        const mapAssets = resources.map;

        const mapManager = MapManager(mapAssets, seedTiledConfig('map_1'), {
            getFutureCharacters: () => ([]),
            pathfinderCreator: Pathfinder,
            tiledManagerCreator: TiledManager
        });

        const tiledMapGraphic = CanvasContext.provider({
            mapManager
        }, () => TiledMapGraphic());

        const { container } = CanvasContext.provider({
            tiledMapGraphic
        }, () => {
            return CharacterGraphic('current', character, sheet);
        });

        app.stage.addChild(container);

        const waitByTime = (ms: number) => new Promise(r => setTimeout(r, ms));

        const { dispatchTimerStart, dispatchTimerEnd } = serviceDispatch({
            dispatchTimerStart: (duration: number): SpellActionTimerStartAction => ({
                type: 'battle/spell-action/start',
                spellActionSnapshot: {
                    battleHash: '',
                    duration,
                    position: character.position,
                    spellId: character.defaultSpell.id,
                    startTime: Date.now(),
                    validated: false
                }
            }),
            dispatchTimerEnd: (): SpellActionTimerEndAction => ({
                type: 'battle/spell-action/end',
                correctHash: '',
                removed: false
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

            character.set({
                position: {
                    x: character.position.x + diffPos.x,
                    y: character.position.y + diffPos.y,
                },
                orientation
            });

            dispatchTimerStart(500);

            await waitByTime(500);

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
