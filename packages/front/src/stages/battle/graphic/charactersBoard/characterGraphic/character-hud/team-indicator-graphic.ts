import * as PIXI from 'pixi.js';
import React from 'react';
import { TeamIndicator, teamIndicatorSizeRem } from '../../../../../../ui/room-ui/map-board/map-board-tile/team-indicator';
import { ReactToGraphicSprite } from '../../../react-to-graphic-sprite';

export type TeamIndicatorGraphic = ReturnType<typeof TeamIndicatorGraphic>;

export const teamIndicatorGraphicSize = 18;

export const TeamIndicatorGraphic = (teamLetter: string) => {

    const container = new PIXI.Container();

    const fontSize = teamIndicatorGraphicSize / teamIndicatorSizeRem;

    const sprite = ReactToGraphicSprite(
        React.createElement(TeamIndicator, {
            teamLetter
        }),
        teamIndicatorGraphicSize,
        teamIndicatorGraphicSize,
        `font-size: ${fontSize}px`
    ).sprite;

    container.addChild(sprite);

    return {
        container
    };
};
