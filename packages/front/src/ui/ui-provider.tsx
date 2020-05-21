import { CssBaseline } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { AssetMap } from '../assetManager/AssetLoader';
import { AssetProvider } from '../assetManager/AssetProvider';
import { Controller } from '../Controller';
import { appTheme } from './app-theme';

const useStyles = makeStyles(() => ({
    '@global': {
        html: {
            fontSize: '62.5%'
        },
        body: {
            overflow: 'hidden'
        }
    }
}));

export const UIProvider: React.FC = ({ children }) => {

    useStyles();

    const [loaderData, setLoaderData] = React.useState<Partial<AssetMap>>({});

    React.useEffect(() => {
        const unsubscribe = Controller.loader.subscribeUnique(data => {
            setLoaderData(data);

         });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AssetProvider value={loaderData}>
            <ThemeProvider theme={appTheme}>
                <CssBaseline />

                {children}

            </ThemeProvider>
        </AssetProvider>
    );
};
