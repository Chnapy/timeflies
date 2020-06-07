import { MapConfig } from '@timeflies/shared';
import _fs from 'fs';

export interface MapManager {
}

interface Dependencies {
    fs: Pick<typeof _fs, 'readFileSync'>;
}

export const MapManager = (mapConfig: MapConfig, { fs }: Dependencies = { fs: _fs }): MapManager => {

    // const { schemaUrl } = mapConfig;

    // const data = fs.readFileSync(urlJoin('public', schemaUrl), 'utf8');

    // const schema: TiledMapOrthogonal = JSON.parse(data);

    // const tiledManager = TiledManager(schema);

    return {
    };
};
