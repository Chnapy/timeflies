import React from 'react';
import { AssetsMap } from './assets-types';

export const AssetsContext = React.createContext<AssetsMap>({
    spritesheets: {},
    maps: {}
});

export const useAssets = () => React.useContext(AssetsContext);
