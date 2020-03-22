import { TiledMap } from '@timeflies/shared';
import { Loader } from 'resource-loader';


export interface AssetMap {
    mapImage: HTMLImageElement;
    mapSchema: TiledMap;
};

export interface AssetLoader {
    newInstance(): LoaderInstance<{}>;
}

interface LoaderInstance<O extends {}> {
    add<K extends keyof AssetMap>(key: K, path: string): LoaderInstance<O & Pick<AssetMap, K>>;
    addMultiple<K extends keyof AssetMap>(o: Record<K, string>): LoaderInstance<O & Pick<AssetMap, K>>;
    load: () => Promise<O>;
}

export const AssetLoader = (): AssetLoader => {

    const loader = new Loader();

    const newInstance = (): LoaderInstance<{}> => {

        const this_: LoaderInstance<{}> = {
            add: <K extends keyof AssetMap>(key: K, path: string) => {
                if (!loader.resources[ key ]) {
                    loader.add(key, path);
                }
                return this_ as LoaderInstance<Pick<AssetMap, K>>;
            },
            addMultiple: <K extends keyof AssetMap>(o: Record<K, string>) => {
                Object.keys(o)
                    .forEach(key => this_.add(key as keyof AssetMap, o[ key ]));
                return this_ as LoaderInstance<Pick<AssetMap, K>>;
            },
            load: () => new Promise((resolve, reject) => {

                loader.load((loader: Loader, resources: Loader.ResourceMap) => {
                    const data: Partial<AssetMap> = {};

                    for (const k of Object.keys(resources)) {
                        const v = resources[ k ]!;

                        if (v.error) {
                            reject(v.error);
                            return;
                        }

                        data[ k ] = v.data;
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
}
