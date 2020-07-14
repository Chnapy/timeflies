import * as PIXI from 'pixi.js';
import React from 'react';
import { TeamIndicator, teamIndicatorSizeRem } from '../../../../../../ui/room-ui/map-board/map-board-tile/team-indicator';
import { ReactToGraphicSprite } from '../../../react-to-graphic-sprite';

export type TeamIndicatorGraphic = ReturnType<typeof TeamIndicatorGraphic>;

export const TeamIndicatorGraphic = (teamLetter: string) => {

    const container = new PIXI.Container();

    const size = 18;

    const fontSize = size / teamIndicatorSizeRem;

    const sprite = ReactToGraphicSprite(
        React.createElement(TeamIndicator, {
            teamLetter
        }),
        size,
        size,
        `font-size: ${fontSize}px`
    ).sprite;

    container.addChild(sprite);

    return {
        container,
        size
    };
};
