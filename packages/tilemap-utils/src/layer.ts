import { TiledMap, TiledLayerTilelayer } from 'tiled-types';

export module Layer {

    const layerNamesMap = {
        placement: 'init',
        background: 'background',
        obstacles: 'obstacles'
    };
    const backLayerList = Object.values(layerNamesMap);

    export type LayerName = keyof typeof layerNamesMap;

    export const getRenderableLayerList = ({ layers }: Pick<TiledMap, 'layers'>): TiledLayerTilelayer[] => {
        return layers.filter((layer): layer is TiledLayerTilelayer => layer.type === 'tilelayer' && layer.name !== layerNamesMap.placement);
    };

    export const getTilelayer = (name: LayerName, { layers }: Pick<TiledMap, 'layers'>): TiledLayerTilelayer => {
        return layers.find((layer): layer is TiledLayerTilelayer => layer.name === name)!;
    };

    export const getForegroundLayers = ({ layers }: Pick<TiledMap, 'layers'>) => {
        return layers.filter((layer): layer is TiledLayerTilelayer => !backLayerList.includes(layer.name));
    };
}
