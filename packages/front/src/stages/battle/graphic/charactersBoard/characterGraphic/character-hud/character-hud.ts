import * as PIXI from 'pixi.js';
import React from 'react';
import { shallowEqual } from 'react-redux';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { GameState } from '../../../../../../game-state';
import { appTheme } from '../../../../../../ui/app-theme';
import { UIIcon, UIIconProps } from '../../../../../../ui/battle-ui/spell-panel/spell-button/ui-icon';
import { GaugeGraphic } from '../../../gauge-graphic';
import { ReactToGraphicSprite } from '../../../react-to-graphic-sprite';
import { TeamIndicatorGraphic, teamIndicatorGraphicSize } from './team-indicator-graphic';

export type CharacterHud = ReturnType<typeof CharacterHud>;

export const CharacterHud = (
    characterId: string
) => {

    const selectCharacter = (state: GameState) => state.battle.snapshotState.battleDataCurrent.characters[ characterId ];

    const container = new PIXI.Container();

    const { tiledMapGraphic: { getTilesize }, storeEmitter, viewportListener } = CanvasContext.consumer('tiledMapGraphic', 'storeEmitter', 'viewportListener');

    const { palette } = appTheme;

    const teamIndicatorContainer = new PIXI.Container();

    const lifeIconSize = 18;

    const lifeIconBg = ReactToGraphicSprite(React.createElement<UIIconProps>(UIIcon, {
        icon: 'life',
        inPixiContext: true
    }), lifeIconSize, lifeIconSize, `color: ${palette.common.white}`).sprite;

    const lifeIcon = ReactToGraphicSprite(React.createElement<UIIconProps>(UIIcon, {
        icon: 'life',
        inPixiContext: true
    }), lifeIconSize - 4, lifeIconSize - 4, `color: ${palette.features.life}`).sprite;
    lifeIcon.x = 2;
    lifeIcon.y = 2;

    const lifeIconContainer = new PIXI.Container();
    lifeIconContainer.addChild(lifeIconBg, lifeIcon);

    const gauge = GaugeGraphic();

    container.addChild(teamIndicatorContainer, lifeIconContainer, gauge.graphic);

    const updateLifeGauge = (totalLife: number, life: number) => {
        const ratio = life / totalLife;

        gauge.update(ratio);
    };

    const onScaleChange = (scaleValue: number) => {
        const scaleInverted = Math.min(1 / scaleValue, 1);

        teamIndicatorContainer.scale.set(scaleInverted);
        lifeIconContainer.scale.set(scaleInverted);
        gauge.graphic.scale.set(scaleInverted);

        lifeIconContainer.y = -18 * scaleInverted;

        gauge.setGeo({
            x: (4 + lifeIconSize) * scaleInverted,
            y: -12 * scaleInverted,
            height: 8
        });

        const schema = storeEmitter.getState().battle.battleActionState.tiledSchema;

        if (schema) {

            const { tilewidth, tileheight } = getTilesize(schema);

            gauge.setGeo({
                width: tilewidth / scaleInverted - (lifeIconSize + 4)
            });

            const teamIndicatorRealSize = teamIndicatorGraphicSize * scaleInverted;

            teamIndicatorContainer.y = tileheight - teamIndicatorRealSize / 3 * 2;
            teamIndicatorContainer.x = -teamIndicatorRealSize / 3;
        }
    };

    viewportListener.onScaleChange(onScaleChange);

    storeEmitter.onStateChange(
        state => {
            const tiledSchema = state.battle.battleActionState.tiledSchema;

            const playerId = selectCharacter(state)?.playerId;
            if (!tiledSchema || !playerId) {
                return null;
            }

            const { playerList, teamList } = state.battle.snapshotState;
            const { teamId } = playerList[ playerId ];
            const { letter } = teamList[ teamId ];

            return letter;
        },
        letter => {
            teamIndicatorContainer.removeChildren();

            if (letter) {
                const teamIndicator = TeamIndicatorGraphic(letter);
                teamIndicatorContainer.addChild(teamIndicator.container);
            }

            onScaleChange(viewportListener.getCurrentScale());
        }
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
