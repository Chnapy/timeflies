import * as PIXI from 'pixi.js';
import React from 'react';
import { TeamIndicator, teamIndicatorSizeRem } from '../../../../../ui/room-ui/map-board/map-board-tile/team-indicator';
import { graphicTheme } from '../../graphic-theme';
import { ReactToGraphicSprite } from '../../react-to-graphic-sprite';

export type TeamIndicatorGraphic = ReturnType<typeof TeamIndicatorGraphic>;

export const TeamIndicatorGraphic = (teamLetter: string) => {
    const { typography } = graphicTheme;

    const container = new PIXI.Container();

    const size = teamIndicatorSizeRem * typography.fontSize;

    const sprite = ReactToGraphicSprite(
        React.createElement(TeamIndicator, {
            teamLetter
        }),
        size,
        size
    );

    container.addChild(sprite);

    return {
        container
    };
};
