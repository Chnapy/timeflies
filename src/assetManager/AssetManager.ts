import { CharacterType, CharacterState, Orientation } from '../phaser/entities/Character';
import sampleMap1Schema from '../_assets/map/map_2.json';
import sampleMap1Image from '../_assets/map/map_2.png';
import sampleSpritesheet1Image from '../_assets/spritesheets/sokoban_spritesheet.png';
import sampleSpritesheet1Schema from '../_assets/spritesheets/sokoban_spritesheet.xml';
import spellsSpritesheetImage from '../_assets/spritesheets/spells_spritesheet.png';
import spellsSpritesheetSchema from '../_assets/spritesheets/spells_spritesheet.xml';
import { SpellType } from '../phaser/entities/Spell';

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

export type IAssetMap = IAssetManager[ 'maps' ];
export type IAssetCharacters = {
    [ K in CharacterType ]: {
        image: string;
        schema: string;
        states: AnimStateMap;
    }
};

export type IAssetSpells = {
    image: string;
    schema: string;
    spellsMap: {
        [ K in SpellType ]: string;
    };
};

function getGenerateFrameConfig(start: number, end: number = start): Phaser.Types.Animations.GenerateFrameNames {
    return {
        start,
        end,
        zeroPad: 2,
        prefix: 'player_',
        suffix: '.png'
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

const AssetCharacters: IAssetCharacters = {
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

const AssetSpells: IAssetSpells = {
    image: spellsSpritesheetImage,
    schema: spellsSpritesheetSchema,
    spellsMap: {
        move: '',
        orientate: '',
        sampleSpell1: 'blizzard-1.png',
        sampleSpell2: 'sword-cold.png',
        sampleSpell3: 'thunder-1.png'
    }
};

export const AssetManager = {
    maps: {
        sampleMap1: {
            image: sampleMap1Image,
            schema: sampleMap1Schema
        }
    },

    characters: AssetCharacters,

    spells: AssetSpells
} as const;
