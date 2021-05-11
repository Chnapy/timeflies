import { ILoaderResource, Loader } from 'pixi.js';
import TiledMap from 'tiled-types';
import { AssetsLoaderMap } from './assets-types';


export const createResourceName = (category: keyof AssetsLoaderMap, rawName: string) => category + '-' + rawName;

const mapImagePrefix = 'map-image--';

export const mapStringUtil = {
    /**
     * 'http://localhost/a/b/c.png' => 'http://localhost/a/b/'
     */
    getBaseUrl: (url: string) => url.substr(0, url.lastIndexOf('/') + 1),

    isMap: (name: string) => name.startsWith(createResourceName('maps', '')),

    isMapImage: (name: string, mapName: string) => name.startsWith(mapImagePrefix + mapName),

    createMapImageResourceName: (mapName: string, imageName: string) => mapImagePrefix + mapName + '>' + imageName,

    extractMapImageName: (imageResourceName: string, mapName: string) => imageResourceName.substr(
        mapStringUtil.createMapImageResourceName(mapName, '').length
    )
} as const;

const mapLoaderMiddleware = function (this: Loader, resource: ILoaderResource, next: () => void): void {
    if (!mapStringUtil.isMap(resource.name)) {
        return next();
    }

    if (resource.error) {
        return next();
    }

    const { url } = resource;
    const map: TiledMap = resource.data;

    const nbrTilesets = map.tilesets.length;

    if (!nbrTilesets) {
        return next();
    }

    let nbrTilesetsCompleted = 0;
    const onTilesetComplete = () => {
        nbrTilesetsCompleted++;
        if (nbrTilesetsCompleted === nbrTilesets) {
            next();
        }
    };

    const baseUrl = mapStringUtil.getBaseUrl(url);

    map.tilesets.forEach(({ name: imageName, image }) => {
        const name = mapStringUtil.createMapImageResourceName(resource.name, imageName);
        if (!this.resources[ name ]) {
            const loadOptions = {
                name,
                url: baseUrl + image,
                parentResource: resource,
                onComplete: onTilesetComplete,
            };
            this.add(loadOptions);
        } else {
            onTilesetComplete();
        }
    });
};

export const createLoader = () => {
    const loader = new Loader();

    loader.use(mapLoaderMiddleware);

    return loader;
};
