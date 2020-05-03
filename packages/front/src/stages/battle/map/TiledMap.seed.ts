import { seedTiledMapAssets, TiledManager, TiledMapAssets, TiledMapSeedKey } from '@timeflies/shared';


export const seedTiledMapAssetsWithImg = (mapKey: TiledMapSeedKey): TiledMapAssets => {

    const { schema } = seedTiledMapAssets(mapKey);

    const images = schema.tilesets.reduce((acc, tileset) => {

        const img = document.createElement('img');
        img.src = 'placeholder';

        acc[ tileset.name ] = img;

        return acc;
    }, {});

    return {
        schema,
        images
    };
};

export const seedTiledManagerWithImg = (mapKey: TiledMapSeedKey): TiledManager => {

    const assets = seedTiledMapAssetsWithImg(mapKey);

    return TiledManager(assets);
};
