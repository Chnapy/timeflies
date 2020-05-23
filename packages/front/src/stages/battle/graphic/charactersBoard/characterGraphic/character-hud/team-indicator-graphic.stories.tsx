import { TeamIndicatorGraphic } from './team-indicator-graphic';
import React from 'react';
import * as PIXI from 'pixi.js';
import { StoryProps } from '../../../../../../../.storybook/preview';

export default {
    title: 'graphic/CharacterGraphic/Team indicator graphic',
    component: TeamIndicatorGraphic
};

export const Default: React.FC<StoryProps> = (props) => <InnerDefault {...props} />;

const InnerDefault: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const rootRef = React.useRef<any>();

    React.useEffect(() => {

        fakeBattleApi.init({});

        const view = rootRef.current;

        const game = new PIXI.Application({ view, width: 100, height: 100, backgroundColor: 0xFFFFFF });

        const indicator = TeamIndicatorGraphic('A');
        game.stage.addChild(indicator.container);

    }, [ fakeBattleApi ]);

    return <canvas ref={rootRef} />;
};
