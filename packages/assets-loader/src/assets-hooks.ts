import { useAssets } from './assets-context';
import { SpritesheetKey } from './assets-types';

export const useAssetSpritesheet = (key: SpritesheetKey) => {
    const { spritesheets } = useAssets();

    return spritesheets[ key ];
};

export const useAssetMap = (key: string) => {
    const { maps } = useAssets();

    return maps[ key ];
};
