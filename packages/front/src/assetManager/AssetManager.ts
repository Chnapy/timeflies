import { SpellType } from '@timeflies/shared';
import spellsSpritesheetImage from '../_assets/spritesheets/spells_spritesheet.png';
import spellsSpritesheetSchema from '../_assets/spritesheets/spells_spritesheet.xml';

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

    spells: AssetSpells
} as const;
