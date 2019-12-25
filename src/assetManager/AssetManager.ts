import sampleMap1Image from '../_assets/map/map.png';
import sampleMap1Schema from '../_assets/map/map.sjson';

import sampleChar1Idle from '../_assets/characters/char1.png';
import sampleChar2Idle from '../_assets/characters/char2.png';
import sampleChar3Idle from '../_assets/characters/char3.png';
import { CharacterType } from '../phaser/entities/Character';

export type IAssetManager = typeof AssetManager;

export type IAssetMap = IAssetManager['map'];
export type IAssetCharacter = {
    [K in CharacterType]: {
        idle: string;
    }
};

const AssetCharacter: IAssetCharacter = {
    sampleChar1: {
        idle: sampleChar1Idle
    },
    sampleChar2: {
        idle: sampleChar2Idle
    },
    sampleChar3: {
        idle: sampleChar3Idle
    }
};

export const AssetManager = {
    map: {
        sampleMap1: {
            image: sampleMap1Image,
            schema: sampleMap1Schema
        }
    },

    character: AssetCharacter
} as const;
