import React from 'react';
import { AssetMap } from '../assetManager/AssetLoader';
import { AssetProvider } from '../assetManager/AssetProvider';
import { Controller } from '../Controller';
import { UIThemeProvider } from './ui-theme-provider';

export const UIProvider: React.FC = ({ children }) => {

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
            <UIThemeProvider>

                {children}

                </UIThemeProvider>
        </AssetProvider>
    );
};
