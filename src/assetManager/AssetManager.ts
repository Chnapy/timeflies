import sampleMap1Image from '../_assets/map/map.png';
import sampleMap1Schema from '../_assets/map/map.sjson';

export type IAssetManager = typeof AssetManager;

export type IAssetMap = IAssetManager['map'];

export const AssetManager = {
    map: {
        sampleMap1: {
            image: sampleMap1Image,
            schema: sampleMap1Schema
        }
    }
} as const;
