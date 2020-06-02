import * as PIXI from 'pixi.js';
import React from 'react';
import { shallowEqual } from 'react-redux';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../../game-state';
import { appTheme } from '../../../../../../ui/app-theme';
import { UIIcon, UIIconProps } from '../../../../../../ui/battle-ui/spell-panel/spell-button/ui-icon';
import { GaugeGraphic } from '../../../gauge-graphic';
import { ReactToGraphicSprite } from '../../../react-to-graphic-sprite';
import { TeamIndicatorGraphic } from './team-indicator-graphic';

export type CharacterHud = ReturnType<typeof CharacterHud>;

export const CharacterHud = (
    characterId: string
) => {

    const selectCharacter = (state: GameState) => state.battle.snapshotState.battleDataCurrent.characters.find(c => c.id === characterId)!;

    const container = new PIXI.Container();

    const { tiledMapGraphic: { getTilesize }, storeEmitter } = CanvasContext.consumer('tiledMapGraphic', 'storeEmitter');

    const { tilewidth, tileheight } = getTilesize();

    const { palette } = appTheme;

    const teamIndicatorContainer = new PIXI.Container();

    const lifeIconSize = 18;

    const lifeIconBg = ReactToGraphicSprite(React.createElement<UIIconProps>(UIIcon, {
        icon: 'life',
        inPixiContext: true
    }), lifeIconSize, lifeIconSize, `color: ${palette.primary.contrastText}`);

    const lifeIcon = ReactToGraphicSprite(React.createElement<UIIconProps>(UIIcon, {
        icon: 'life',
        inPixiContext: true
    }), lifeIconSize - 4, lifeIconSize - 4);
    lifeIcon.x = 2;
    lifeIcon.y = 2;

    const lifeIconContainer = new PIXI.Container();
    lifeIconContainer.addChild(lifeIconBg, lifeIcon);
    lifeIconContainer.y = -18;

    const gauge = GaugeGraphic();
    gauge.setGeo({
        x: 22,
        y: -12,
        width: tilewidth - 22,
        height: 6
    });

    container.addChild(teamIndicatorContainer, lifeIconContainer, gauge.graphic);

    const updateLifeGauge = (totalLife: number, life: number) => {
        const ratio = life / totalLife;

        gauge.update(ratio);
    };

    storeEmitter.onStateChange(
        state => {
            const { playerId } = selectCharacter(state);
            const { teamId } = state.battle.snapshotState.battleDataCurrent.players.find(p => p.id === playerId)!;
            return state.battle.snapshotState.battleDataCurrent.teams.find(t => t.id === teamId)!.letter;
        },
        letter => {
            teamIndicatorContainer.removeChildren();

            const teamIndicator = TeamIndicatorGraphic(letter);
            teamIndicator.container.y = tileheight - teamIndicator.size;

            teamIndicatorContainer.addChild(teamIndicator.container);
        }
    );

    storeEmitter.onStateChange(
        state => {
            const { staticData, features } = selectCharacter(state);
            return {
                totalLife: staticData.initialFeatures.life,
                life: features.life
            };
        },
        ({ totalLife, life }) => {
            updateLifeGauge(totalLife, life);
        },
        shallowEqual
    );

    return {
        container
    };
};
