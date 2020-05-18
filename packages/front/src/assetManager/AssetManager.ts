import { SpellType } from '@timeflies/shared';
import spellsSpritesheetImage from '../_assets/spritesheets/spells_spritesheet.png';
import spellsSpritesheetSchema from '../_assets/spritesheets/spells_spritesheet.xml';
import charactersSpritesheetPath from '../_assets/spritesheets/sokoban.json';
import mapPath from '../_assets/map/map.json';
import mapPreviewPath from '../_assets/map/map_preview.png';

export type IAssetManager = typeof AssetManager;

export type IAssetSpells = {
    image: string;
    schema: string;
    spellsMap: {
        [ K in SpellType ]: string;
    };
};

const AssetSpells: IAssetSpells = {
    image: spellsSpritesheetImage,
    schema: spellsSpritesheetSchema,
    spellsMap: {
        move: 'attack_mask',
        orientate: '',
        simpleAttack: 'thunder-1',
        sampleSpell1: 'blizzard-1',
        sampleSpell2: 'sword-cold',
        sampleSpell3: 'thunder-1'
    }
};

export const AssetManager = {

    spritesheets: {
        characters: charactersSpritesheetPath,
    },

    spells: AssetSpells,

    fake: {
        mapSchema: mapPath,

        mapPreview: mapPreviewPath
    }
} as const;
