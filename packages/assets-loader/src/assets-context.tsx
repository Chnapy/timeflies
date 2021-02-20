import React from 'react';
import { AssetsMap } from './assets-types';

export const AssetsContext = React.createContext<AssetsMap>({
    spritesheets: {},
    maps: {}
});
AssetsContext.displayName = 'AssetsContext';

export const useAssets = () => React.useContext(AssetsContext);
