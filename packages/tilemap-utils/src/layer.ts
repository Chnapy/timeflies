import { TiledMap, TiledLayerTilelayer } from 'tiled-types';

export module Layer {

    const layerNamesMap = {
        placement: 'placement',
        background: 'background',
        obstacles: 'obstacles'
    };

    const extraLayerPrefixMap = {
        backgroundExtra: 'background-',
        foreground: 'foreground-'
    };

    export type LayerName = keyof typeof layerNamesMap;

    export const getRenderableLayerList = ({ layers }: Pick<TiledMap, 'layers'>): TiledLayerTilelayer[] => {
        return layers.filter((layer): layer is TiledLayerTilelayer => layer.type === 'tilelayer' && layer.name !== layerNamesMap.placement);
    };

    export const getTilelayer = (name: LayerName, { layers }: Pick<TiledMap, 'layers'>): TiledLayerTilelayer => {
        return layers.find((layer): layer is TiledLayerTilelayer => layer.name === layerNamesMap[ name ])!;
    };

    export const getBackgroundExtraLayers = ({ layers }: Pick<TiledMap, 'layers'>) => {
        return layers.filter((layer): layer is TiledLayerTilelayer => layer.name.startsWith(extraLayerPrefixMap.backgroundExtra));
    };

    export const getForegroundLayers = ({ layers }: Pick<TiledMap, 'layers'>) => {
        return layers.filter((layer): layer is TiledLayerTilelayer => layer.name.startsWith(extraLayerPrefixMap.foreground));
    };
}
