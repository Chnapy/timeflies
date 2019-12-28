import { CharacterType, CharacterState, Orientation } from '../phaser/entities/Character';
import sampleMap1Schema from '../_assets/map/map_2.json';
import sampleMap1Image from '../_assets/map/map_2.png';
import sampleSpritesheet1Image from '../_assets/spritesheets/sokoban_spritesheet.png';
import sampleSpritesheet1Schema from '../_assets/spritesheets/sokoban_spritesheet.xml';

export type IAssetManager = typeof AssetManager;

type AnimStateMap = {
    [ ST in CharacterState ]: {
        [ SI in Orientation ]: {
            frameNames: Phaser.Types.Animations.GenerateFrameNames | Phaser.Types.Animations.AnimationFrame[];
            frameRate: number;
            frameRepeat: number;
        };
    };
};

export type IAssetMap = IAssetManager[ 'map' ];
export type IAssetCharacter = {
    [ K in CharacterType ]: {
        image: string;
        schema: string;
        states: AnimStateMap;
    }
};
// let a = (window as any).a = []
function getGenerateFrameConfig(start: number, end: number = start): Phaser.Types.Animations.GenerateFrameNames {
    return {
        start,
        end,
        zeroPad: 2,
        prefix: 'player_',
        suffix: '.png',
        // outputArray: a
    };
}

const getGenerateFrameArray = (...frames: number[]): Phaser.Types.Animations.GenerateFrameNames => ({
    zeroPad: 2,
    prefix: 'player_',
    suffix: '.png',
    frames: frames as any
});

const AssetCharacterStateMap: AnimStateMap = {
    idle: {
        left: {
            frameNames: getGenerateFrameConfig(14),
            frameRate: 24,
            frameRepeat: 0
        },
        right: {
            frameNames: getGenerateFrameConfig(11),
            frameRate: 24,
            frameRepeat: 0
        },
        top: {
            frameNames: getGenerateFrameConfig(2),
            frameRate: 24,
            frameRepeat: 0
        },
        bottom: {
            frameNames: getGenerateFrameConfig(23),
            frameRate: 24,
            frameRepeat: 0
        }
    },
    move: {
        left: {
            frameNames: getGenerateFrameConfig(14, 16),
            frameRate: 15,
            frameRepeat: -1
        },
        right: {
            frameNames: getGenerateFrameConfig(11, 13),
            frameRate: 15,
            frameRepeat: -1
        },
        top: {
            frameNames: getGenerateFrameConfig(2, 4),
            frameRate: 15,
            frameRepeat: -1
        },
        bottom: {
            frameNames: getGenerateFrameArray(23, 24, 1),
            frameRate: 15,
            frameRepeat: -1
        }
    }
};

const AssetCharacter: IAssetCharacter = {
    sampleChar1: {
        image: sampleSpritesheet1Image,
        schema: sampleSpritesheet1Schema,
        states: AssetCharacterStateMap
    },
    sampleChar2: {
        image: sampleSpritesheet1Image,
        schema: sampleSpritesheet1Schema,
        states: AssetCharacterStateMap
    },
    sampleChar3: {
        image: sampleSpritesheet1Image,
        schema: sampleSpritesheet1Schema,
        states: AssetCharacterStateMap
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
