import charactersSpritesheetPath from '../_assets/spritesheets/sokoban.json';
import spellsSpritesheetPath from '../_assets/spritesheets/spritesheet-spells.json';
import mapPath from '../_assets/map/map.json';
import mapPreviewPath from '../_assets/map/map_preview.png';

export type IAssetManager = typeof AssetManager;

export const AssetManager = {

    spritesheets: {
        characters: charactersSpritesheetPath,
        spells: spellsSpritesheetPath
    },

    fake: {
        mapSchema: mapPath,

        mapPreview: mapPreviewPath
    }
} as const;
