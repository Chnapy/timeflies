
type MapKey =
    | 'sampleMap1';

export interface MapInfos {

    urls: {
        schema: string;
        sheet: string;
    };

    mapKey: MapKey;

    tilemapKey: string;

    decorLayerKey: string;

    obstaclesLayerKey: string;
}
