import React from 'react';
import { StoryProps } from '../../../../../.storybook/preview';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { useAssetLoader } from '../../../../assetManager/AssetProvider';
import { seedBattleData } from '../../../../battle-data.seed';
import { seedGameState } from '../../../../game-state.seed';
import { CharacterImage } from './character-image';

export default {
    title: 'Battle/Character list panel/Character item/Character image',
    component: CharacterImage
};

const InnerDefault: React.FC = () => {
    useAssetLoader('characters', AssetManager.spritesheets.characters, true);

    return <>
        <CharacterImage characterType='sampleChar1' size={56} />
        <CharacterImage characterType='sampleChar2' size={64} />
    </>;
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData()
    });

    const { Provider } = fakeBattleApi.init({ initialState });

    return <Provider>
        <InnerDefault />
    </Provider>;
};
