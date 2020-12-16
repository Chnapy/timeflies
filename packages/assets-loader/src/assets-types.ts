import { LoaderResource, Spritesheet } from 'pixi.js';
import TiledMap from 'tiled-types';

export type SpritesheetKey = 'entities';

export type AssetsLoaderMap = {
    spritesheets: { [ key in SpritesheetKey ]?: string };
    maps: { [ key in string ]?: string };
};

export type LoaderResourceSpritesheet = {
    spritesheet: Spritesheet;
    resource: LoaderResource;
};

export type TiledMapAssets = {
    schema: TiledMap;
    images: Record<string, string>;
};

export type AssetsMap = {
    spritesheets: { [ key in SpritesheetKey ]?: LoaderResourceSpritesheet };
    maps: { [ key in string ]?: TiledMapAssets };
};
