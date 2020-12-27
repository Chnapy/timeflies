import { Assets } from '@timeflies/static-assets';
import { useAssets } from './assets-context';

export const useAssetSpritesheet = (key: Assets.SpritesheetKey) => {
    const { spritesheets } = useAssets();

    return spritesheets[ key ];
};

export const useAssetMap = (key: string) => {
    const { maps } = useAssets();

    return maps[ key ];
};
