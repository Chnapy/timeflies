import { TiledMap, TiledMapAssets } from '@timeflies/shared';
import { IAddOptions, ImageLoadStrategy, Loader, Resource } from 'resource-loader';
import { AbstractLoadStrategyCtor } from 'resource-loader/dist/load_strategies/AbstractLoadStrategy';
import { MockLoadStrategy } from './AssetLoader.seed';

export interface AssetMap {
    map: TiledMapAssets;

    // for tests
    sampleImage: HTMLImageElement;
    sampleJSON: object;
};

type AssetMapKey = keyof AssetMap;

export interface AssetLoader {
    newInstance(): LoaderInstance<{}>;
}

interface Dependencies {
    loadStrategy?: AbstractLoadStrategyCtor;
}

interface LoaderInstance<O extends {}> {
    add<K extends keyof AssetMap>(key: K, path: string): LoaderInstance<O & Pick<AssetMap, K>>;
    addMultiple<K extends keyof AssetMap>(o: Record<K, string>): LoaderInstance<O & Pick<AssetMap, K>>;
    load: () => Promise<O>;
}

// check in runtime if we're in test env, 
// because of high level tests where it's not conveniant to inject the mock
const initialDependencies: Dependencies = process.env.NODE_ENV === 'test'
    ? { loadStrategy: MockLoadStrategy }
    : {};

const mapKey: AssetMapKey = 'map';
const mapImageKeyPrefix = 'map:';

const mapStringUtil = {
    /**
     * 'http://localhost/a/b/c.png' => 'http://localhost/a/b/'
     */
    getBaseUrl: (url: string) => url.substr(0, url.lastIndexOf('/') + 1),

    isMap: (key: string) => key === mapKey,

    isMapImage: (key: string) => key.startsWith(mapImageKeyPrefix),

    getMapImage: (name: string) => mapImageKeyPrefix + name,
} as const;

const getResourcesErrors = (resources: Loader.ResourceMap, keys: string[]): string[] => keys
    .map(k => resources[ k ]!.error)
    .filter(Boolean);

const getAssets = (resources: Loader.ResourceMap, keys: string[], key: string): AssetMap[ AssetMapKey ] => {
    if (mapStringUtil.isMap(key)) {
        return getTiledMapAssets(resources, keys);
    }

    return resources[ key ]!.data;
}

const getTiledMapAssets = (resources: Loader.ResourceMap, keys: string[]): TiledMapAssets => {
    const schema: TiledMap = resources[ mapKey ]!.data;

    const mapImageKeys = keys.filter(k => mapStringUtil.isMapImage(k));
    const images: Record<string, HTMLImageElement> = mapImageKeys.reduce((o, k) => {

        const img = resources[ k ]!.data;
        const imgKey = k.substr(k.indexOf(':') + 1);

        o[ imgKey ] = img;

        return o;
    }, {});

    return {
        schema,
        images
    };
};

const mapLoaderMiddleware = (loadStrategy: AbstractLoadStrategyCtor | undefined) => function (this: Loader, resource: Resource, next: () => void): void {
    if (!mapStringUtil.isMap(resource.name)) {
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

    map.tilesets.forEach(({ name, image }) => {
        const loadOptions: IAddOptions = {
            name: mapStringUtil.getMapImage(name),
            url: baseUrl + image,
            strategy: loadStrategy ?? ImageLoadStrategy,
            parentResource: resource,
            onComplete: onTilesetComplete,
        };
        this.add(loadOptions);
    });
};

export const AssetLoader = ({ loadStrategy }: Dependencies = initialDependencies): AssetLoader => {

    const loader = new Loader();

    loader.use(mapLoaderMiddleware(loadStrategy));

    const newInstance = (): LoaderInstance<{}> => {

        const this_: LoaderInstance<{}> = {

            add: <K extends keyof AssetMap>(key: K, path: string) => {
                if (!loader.resources[ key ]) {
                    loader.add({
                        name: key,
                        url: path,
                        strategy: loadStrategy
                    })
                }
                return this_ as LoaderInstance<Pick<AssetMap, K>>;
            },

            addMultiple: <K extends keyof AssetMap>(o: Record<K, string>) => {
                Object.keys(o)
                    .forEach(key => this_.add(key as keyof AssetMap, o[ key ]));
                return this_ as LoaderInstance<Pick<AssetMap, K>>;
            },

            load: () => new Promise((resolve, reject) => {

                loader.load((_: Loader, resources: Loader.ResourceMap) => {
                    const data: Partial<AssetMap> = {};

                    const keys = Object.keys(resources);

                    const errors = getResourcesErrors(resources, keys);

                    if (errors.length) {
                        return reject(errors);
                    }

                    for (const k of keys.filter(k => !mapStringUtil.isMapImage(k))) {
                        data[ k ] = getAssets(resources, keys, k);
                    }

                    resolve(data);
                });
            })
        };

        return this_;
    };

    return {
        newInstance
    };
};
