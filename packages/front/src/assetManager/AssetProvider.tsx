import React, { useContext } from 'react';
import { AssetMap, AssetMapKey, SpritesheetMapKey } from './AssetLoader';
import { Controller } from '../Controller';

const context = React.createContext<Partial<AssetMap>>({});

export const AssetProvider = context.Provider;

export const useAsset = <K extends AssetMapKey>(key: K) => useContext(context)[ key ];

/**
 * Storybook context only
 */
export const useAssetLoader = <K extends AssetMapKey>(key: K, path: string, isSpritesheet: boolean) => {

    React.useEffect(() => {

        if (isSpritesheet) {
            Controller.loader.newInstance()
                .addSpritesheet(key as SpritesheetMapKey, path)
                .load();
        } else {
            Controller.loader.newInstance()
                .add(key as any, path)
                .load();
        }

    }, [ isSpritesheet, key, path ]);

    return useAsset(key);
};
