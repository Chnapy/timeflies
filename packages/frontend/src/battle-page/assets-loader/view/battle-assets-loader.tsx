import { AssetsLoader } from '@timeflies/assets-loader';
import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { useGameSelector } from '../../../store/hooks/use-game-selector';

export const BattleAssetsLoader: React.FC = ({ children }) => {

    const tiledMapInfos = useGameSelector(({ battle }) => battle?.tiledMapInfos);

    const maps = React.useMemo(() => tiledMapInfos
        ? { [ tiledMapInfos.name ]: tiledMapInfos.schemaLink }
        : {}, [ tiledMapInfos ]);

    return (
        <AssetsLoader
            spritesheets={Assets.spritesheets}
            maps={maps}
        >
            {children}
        </AssetsLoader>
    );
};
