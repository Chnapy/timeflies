import { Assets } from '@timeflies/static-assets';
import { LoaderResource, Spritesheet } from 'pixi.js';
import TiledMap from 'tiled-types';

export type AssetsLoaderMap = {
    spritesheets: { [ key in Assets.SpritesheetKey ]?: string };
    maps: { [ key in string ]?: string };
};

export type LoaderResourceSpritesheet = {
    resource: LoaderResource;
    spritesheet: Spritesheet;
    spritesheetUrl: string;
};

export type TiledMapAssets = {
    schema: TiledMap;
    images: Record<string, string>;
};

export type AssetsMap = {
    spritesheets: { [ key in Assets.SpritesheetKey ]?: LoaderResourceSpritesheet };
    maps: { [ key in string ]?: TiledMapAssets };
};
