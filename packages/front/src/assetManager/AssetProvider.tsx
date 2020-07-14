import React, { useContext } from 'react';
import { AssetLoader, AssetMap, AssetMapKey, SpritesheetMapKey } from './AssetLoader';

const context = React.createContext<Partial<AssetMap>>({});

export const AssetProvider = context.Provider;

export const useAsset = <K extends AssetMapKey>(key: K) => useContext(context)[ key ];

/**
 * Storybook context only
 */
export const useAssetLoader = <K extends AssetMapKey>(loader: AssetLoader, key: K, path: string, isSpritesheet: boolean) => {

    React.useEffect(() => {

        if (isSpritesheet) {
            loader.newInstance()
                .addSpritesheet(key as SpritesheetMapKey, path)
                .load()
                .catch(console.error);
        } else {
            loader.newInstance()
                .add(key as any, path)
                .load()
                .catch(console.error);
        }

    }, [ isSpritesheet, key, loader, path ]);

    return useAsset(key);
};
