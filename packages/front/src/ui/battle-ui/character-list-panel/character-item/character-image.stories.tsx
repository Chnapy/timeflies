import React from 'react';
import { AssetLoader, createAssetLoader } from '../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { useAssetLoader } from '../../../../assetManager/AssetProvider';
import { seedGameState } from '../../../../game-state.seed';
import { createStoreManager } from '../../../../store/store-manager';
import { createView } from '../../../../view';
import { battleReducer } from '../../../reducers/battle-reducers/battle-reducer';
import { CharacterImage } from './character-image';

export default {
    title: 'Battle/Character list panel/Character item/Character image',
    component: CharacterImage
};

const InnerDefault: React.FC<{ loader: AssetLoader }> = ({ loader }) => {
    useAssetLoader(loader, 'characters', AssetManager.spritesheets.characters, true);

    return <>
        <CharacterImage characterType='sampleChar1' size={56} />
        <CharacterImage characterType='sampleChar2' size={64} />
    </>;
};

export const Default: React.FC = () => {

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: battleReducer(undefined, { type: '' })
    });

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
        middlewareList: []
    });

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { },
        gameUIChildren: <InnerDefault loader={assetLoader} />
    });

    return view;
};
