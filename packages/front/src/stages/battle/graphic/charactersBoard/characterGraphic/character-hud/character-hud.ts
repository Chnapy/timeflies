import * as PIXI from 'pixi.js';
import React from 'react';
import { CanvasContext } from '../../../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../../../services/serviceEvent';
import { appTheme } from '../../../../../../ui/app-theme';
import { UIIcon, UIIconProps } from '../../../../../../ui/battle-ui/spell-panel/spell-button/ui-icon';
import { Character } from '../../../../entities/character/Character';
import { SpellActionTimerEndAction } from '../../../../spellAction/spell-action-manager-actions';
import { GaugeGraphic } from '../../../gauge-graphic';
import { ReactToGraphicSprite } from '../../../react-to-graphic-sprite';
import { TeamIndicatorGraphic } from './team-indicator-graphic';

export type CharacterHud = ReturnType<typeof CharacterHud>;

export const CharacterHud = (
    character: Readonly<Character<'current'>>
) => {

    const { onAction } = serviceEvent();

    const { tiledMapGraphic: { tilewidth, tileheight } } = CanvasContext.consumer('tiledMapGraphic');

    const { palette } = appTheme;

    const teamIndicator = TeamIndicatorGraphic(character.player.team.letter);
    teamIndicator.container.y = tileheight - teamIndicator.size;

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

    const container = new PIXI.Container();
    container.addChild(teamIndicator.container, lifeIconContainer, gauge.graphic);

    const updateLifeGauge = () => {
        const { life: totalLife } = character.staticData.initialFeatures;
        const { life } = character.features;

        const ratio = life / totalLife;

        gauge.update(ratio);
    };

    updateLifeGauge();

    onAction(SpellActionTimerEndAction, updateLifeGauge);

    return {
        container
    };
};
