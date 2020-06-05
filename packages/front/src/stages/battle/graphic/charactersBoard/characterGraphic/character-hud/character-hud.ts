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

    const selectCharacter = (state: GameState) => state.battle.snapshotState.battleDataCurrent.characters.find(c => c.id === characterId);

    const container = new PIXI.Container();

    const { tiledMapGraphic: { getTilesize }, storeEmitter } = CanvasContext.consumer('tiledMapGraphic', 'storeEmitter');

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
        height: 6
    });

    container.addChild(teamIndicatorContainer, lifeIconContainer, gauge.graphic);

    const updateLifeGauge = (totalLife: number, life: number) => {
        const ratio = life / totalLife;

        gauge.update(ratio);
    };

    storeEmitter.onStateChange(
        state => {
            const tiledSchema = state.battle.battleActionState.tiledSchema;

            const playerId = selectCharacter(state)?.playerId;
            if (!tiledSchema || !playerId) {
                return null;
            }

            const { battleDataCurrent } = state.battle.snapshotState;
            const { teamId } = battleDataCurrent.players.find(p => p.id === playerId)!;
            const { letter } = battleDataCurrent.teams.find(t => t.id === teamId)!;

            return { letter, tiledSchema };
        },
        letterAndSchema => {
            teamIndicatorContainer.removeChildren();

            if (!letterAndSchema) {
                return;
            }

            const { letter, tiledSchema } = letterAndSchema;

            const { tilewidth, tileheight } = getTilesize(tiledSchema);
            gauge.setGeo({
                width: tilewidth - 22,
            });

            const teamIndicator = TeamIndicatorGraphic(letter);
            teamIndicator.container.y = tileheight - teamIndicator.size;

            teamIndicatorContainer.addChild(teamIndicator.container);
        },
        shallowEqual
    );

    storeEmitter.onStateChange(
        state => {
            const character = selectCharacter(state);
            if (!character) {
                return {
                    totalLife: 0,
                    life: 0
                };
            }

            const { staticData, features } = character;
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
