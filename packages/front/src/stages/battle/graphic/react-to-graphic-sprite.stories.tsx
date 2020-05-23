import React from 'react';
import * as PIXI from 'pixi.js';
import { StoryProps } from '../../../../.storybook/preview';
import { ReactToGraphicSprite } from './react-to-graphic-sprite';
import { Typography } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { UIIcon } from '../../../ui/battle-ui/spell-panel/spell-button/ui-icon';

export default {
    title: 'graphic/React to graphic sprite',
    component: ReactToGraphicSprite
};

export const Default: React.FC<StoryProps> = (props) => <InnerDefault {...props} />;

const InnerDefault: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const rootRef = React.useRef<any>();

    React.useEffect(() => {

        fakeBattleApi.init({});

        const view = rootRef.current;

        const game = new PIXI.Application({ view, width: 1000, height: 100, backgroundColor: 0xFFFFFF });

        const graphic = new PIXI.Graphics();
        game.stage.addChild(graphic);

        graphic.beginFill(0xFF666622);
        graphic.drawRect(0, 0, 500, 100);
        graphic.endFill();

        const someText = ReactToGraphicSprite(<div>some basic text</div>, 100, 10);

        const muiTypography = ReactToGraphicSprite(<Typography variant='h6'>Mui typography h6</Typography>, 100, 50);
        muiTypography.x = 100;

        const muiIcon = ReactToGraphicSprite(<FavoriteIcon/>, 24, 24);
        muiIcon.x = 200;

        const muiUIIcon = ReactToGraphicSprite(<UIIcon icon='life' inPixiContext/>, 24, 24, 'color: white');
        muiUIIcon.x = 300;

        game.stage.addChild(someText, muiTypography, muiIcon, muiUIIcon);

    }, [ fakeBattleApi ]);

    return <canvas ref={rootRef} />;
};

