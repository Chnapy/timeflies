import React from 'react';
import { AssetsMap } from './assets-types';

const assetsContext = React.createContext<AssetsMap>({
    spritesheets: {},
    maps: {}
});

export const AssetsContextProvider = assetsContext.Provider;

export const useAssets = () => React.useContext(assetsContext);
