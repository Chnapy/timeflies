import { ObjectTyped } from '@timeflies/common';
import React from 'react';
import { AssetsContextProvider } from './assets-context';
import { AssetsLoaderMap, AssetsMap } from './assets-types';
import { createLoader, createResourceName, mapStringUtil } from './create-loader';

const loader = createLoader();

const resourcesToAssetsMap = (loaderMap: AssetsLoaderMap): AssetsMap => {
    return {
        spritesheets: ObjectTyped.entries(loaderMap.spritesheets).reduce<AssetsMap[ 'spritesheets' ]>((acc, [ name, url ]) => {
            const resourceName = createResourceName('spritesheets', name);

            const resource = loader.resources[ resourceName ];
            if (resource) {

                const spritesheet = resource.spritesheet!;

                acc[ name ] = {
                    resource,
                    spritesheet
                };
            }

            return acc;
        }, {}),
        maps: ObjectTyped.entries(loaderMap.maps).reduce<AssetsMap[ 'maps' ]>((acc, [ mapName, url ]) => {
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
    const generateAssetsMap = () => resourcesToAssetsMap({ spritesheets, maps });
    const [ assetsMap, setAssetsMap ] = React.useState<AssetsMap>(generateAssetsMap);

    React.useEffect(() => {
        console.log('resources', loader.resources);

        const getResourcesInfos = (category: keyof AssetsLoaderMap, map: {}) => ObjectTyped.entries(map)
            .map(([ name, url ]): [ string, string | undefined ] => ([ createResourceName(category, name), url ]));

        const resourcesToLoad = [
            ...getResourcesInfos('spritesheets', spritesheets),
            ...getResourcesInfos('maps', maps),
        ]
            .filter(([ resourceName ]) => !loader.resources[ resourceName ]);

        if (resourcesToLoad.length) {
            console.log('reasources-to-load', resourcesToLoad)

            resourcesToLoad.forEach(([ resourceName, url ]) => {
                loader.add({ name: resourceName, url });
            });

            loader.load(() => {
                console.log('loadede', loader.resources);
                console.log('assetsMap', generateAssetsMap());
                setAssetsMap(
                    generateAssetsMap()
                );
            });
        }

    }, [ spritesheets, maps ]);

    return (
        <AssetsContextProvider value={assetsMap}>
            {children}
        </AssetsContextProvider>
    );
};
