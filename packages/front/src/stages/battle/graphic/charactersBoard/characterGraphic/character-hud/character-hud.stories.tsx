import { TiledManager } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { StoryProps } from '../../../../../../../.storybook/preview';
import { AssetLoader } from '../../../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../../../assetManager/AssetManager';
import { seedBattleData } from '../../../../../../battle-data.seed';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { seedGameState } from '../../../../../../game-state.seed';
import { seedCharacter } from '../../../../entities/character/Character.seed';
import { seedPlayer } from '../../../../entities/player/Player.seed';
import { seedTeam } from '../../../../entities/team/Team.seed';
import { MapManager } from '../../../../map/MapManager';
import { Pathfinder } from '../../../../map/Pathfinder';
import { TiledMapGraphic } from '../../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud';

export default {
    title: 'graphic/CharacterGraphic/Character HUD',
    component: CharacterHud
};

export const Default: React.FC<StoryProps> = (props) => <InnerDefault {...props} />;

const InnerDefault: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const rootRef = React.useRef<any>();

    React.useEffect(() => {

        const use = async () => {

            fakeBattleApi.init({
                initialState: seedGameState('p1', {
                    step: 'battle',
                    battle: seedBattleData()
                })
            });

            const view = rootRef.current;

            const game = new PIXI.Application({ view, width: 200, height: 200, backgroundColor: 0x888888 });

            const character = seedCharacter('fake', {
                id: 'c1', period: 'current', player: seedPlayer('fake', {
                    id: 'p1', period: 'current', team: seedTeam('fake', { id: 't1', letter: 'A', period: 'current', seedPlayers: [] })
                })
            });

            const loader = AssetLoader();

            const resources = await loader.newInstance()
                .add('map', AssetManager.fake.mapSchema)
                .load();

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
            }, () => CharacterHud(character));

            const graphic = new PIXI.Graphics();
            graphic.beginFill(0xDDDDDD);
            graphic.drawRect(0, 0, tiledMapGraphic.tilewidth, tiledMapGraphic.tileheight);
            graphic.endFill();

            game.stage.addChild(graphic, container);
            game.stage.x = 50;
            game.stage.y = 50;
        };

        use();

    }, [ fakeBattleApi ]);

    return <canvas ref={rootRef} />;
};
