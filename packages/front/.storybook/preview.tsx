import CssBaseline from '@material-ui/core/CssBaseline';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { addDecorator } from '@storybook/react';
import React from 'react';
import { appTheme } from '../src/ui/app-theme';
// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/sokoban.png';
import { FakeBattleApi } from './fake-battle-api';

export interface StoryProps {
    fakeBattleApi: ReturnType<typeof FakeBattleApi>;
}

addDecorator((storyFn, context) => {

    const fakeBattleApi = FakeBattleApi();

    const props: StoryProps = {
        fakeBattleApi
    };

    return (

        <ThemeProvider theme={appTheme}>
            <CssBaseline />

            {storyFn({
                ...context,
                ...props
            })}

        </ThemeProvider>
    );
})
