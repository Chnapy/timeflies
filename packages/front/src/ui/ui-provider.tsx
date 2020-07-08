import React from 'react';
import { AssetLoader, AssetMap } from '../assetManager/AssetLoader';
import { AssetProvider } from '../assetManager/AssetProvider';
import './pixi-settings';
import { UIThemeProvider } from './ui-theme-provider';

type UIProviderProps = {
    assetLoader: AssetLoader;
};

export const UIProvider: React.FC<UIProviderProps> = ({ assetLoader, children }) => {

    const [ loaderData, setLoaderData ] = React.useState<Partial<AssetMap>>({});

    React.useEffect(() => {
        const unsubscribe = assetLoader.subscribeUnique(data => {
            setLoaderData(data);
        });

        return () => {
            unsubscribe();
        };
    }, [ assetLoader ]);

    return (
        <AssetProvider value={loaderData}>
            <UIThemeProvider>

                {children}

            </UIThemeProvider>
        </AssetProvider>
    );
};
