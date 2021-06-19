import { ObjectTyped } from '@timeflies/common';
import { Loader } from 'pixi.js';
import React from 'react';
import { AssetsContext } from './assets-context';
import { AssetsLoaderMap, AssetsMap } from './assets-types';
import { createLoader, createResourceName, mapStringUtil } from './create-loader';

const resourcesToAssetsMap = (loader: Loader, loaderMap: AssetsLoaderMap): AssetsMap => {
    return {
        spritesheets: ObjectTyped.entries(loaderMap.spritesheets).reduce<AssetsMap[ 'spritesheets' ]>((acc, [ name ]) => {
            const resourceName = createResourceName('spritesheets', name);

            const resource = loader.resources[ resourceName ];
            if (resource) {
                const imageResource = loader.resources[ resourceName + '_image' ];

                const spritesheetUrl = imageResource.url;

                const spritesheet = resource.spritesheet!;

                acc[ name ] = {
                    resource,
                    spritesheet,
                    spritesheetUrl
                };
            }

            return acc;
        }, {}),
        maps: ObjectTyped.entries(loaderMap.maps).reduce<AssetsMap[ 'maps' ]>((acc, [ mapName ]) => {
            const resourceName = createResourceName('maps', mapName);

            const resource = loader.resources[ resourceName ];
            if (resource) {

                const images = Object.entries(loader.resources)
                    .filter(([ name ]) => mapStringUtil.isMapImage(name, resourceName))
                    .reduce<Record<string, string>>((acc, [ name, resource ]) => {
                        const imageName = mapStringUtil.extractMapImageName(name, resourceName);

                        acc[ imageName ] = resource.url;

                        return acc;
                    }, {});

                acc[ mapName ] = {
                    schema: resource.data,
                    images
                };
            }

            return acc;
        }, {})
    };
};

export const AssetsLoader: React.FC<AssetsLoaderMap> = ({
    spritesheets, maps, children
}) => {
    const generateAssetsMap = React.useCallback((loader: Loader = Loader.shared) => resourcesToAssetsMap(loader, { spritesheets, maps }), [ spritesheets, maps ]);
    const [ assetsMap, setAssetsMap ] = React.useState<AssetsMap>(generateAssetsMap);
    const currentLoaderRef = React.useRef<Loader>();

    React.useEffect(() => {
        currentLoaderRef.current?.reset();

        const loader = createLoader();
        currentLoaderRef.current = loader;

        const getResourcesInfos = (category: keyof AssetsLoaderMap, map: {}) => ObjectTyped.entries(map)
            .map(([ name, url ]): [ string, string | undefined ] => ([ createResourceName(category, name), url ]));

        const resourcesToLoad = [
            ...getResourcesInfos('spritesheets', spritesheets),
            ...getResourcesInfos('maps', maps),
        ]
        // .filter(([ resourceName ]) => !loader.resources[ resourceName ]);

        if (resourcesToLoad.length) {
            resourcesToLoad.forEach(([ resourceName, url ]) => {
                loader.add({ name: resourceName, url });
            });

            loader.load(() => {
                if (currentLoaderRef.current !== loader) {
                    return;
                }

                setAssetsMap(
                    generateAssetsMap(loader)
                );
            });
        }

    }, [ spritesheets, maps, generateAssetsMap ]);

    return (
        <AssetsContext.Provider value={assetsMap}>
            {children}
        </AssetsContext.Provider>
    );
};
