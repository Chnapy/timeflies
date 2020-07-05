import { MapConfig, TiledManager, PromisePayload } from '@timeflies/shared';
import fs from 'fs';
import TiledMap from 'tiled-types';
import urlJoin from 'url-join';
import util from 'util';

const _readFile = util.promisify(fs.readFile);

export type MapManager = PromisePayload<ReturnType<typeof MapManager>>;

type Dependencies = {
    readFile: typeof _readFile;
};

export const MapManager = async (mapConfig: MapConfig, { readFile }: Dependencies = { readFile: _readFile }) => {

    const { schemaUrl } = mapConfig;

    const data = await readFile(urlJoin('public', schemaUrl), 'utf8');

    const schema: TiledMap = JSON.parse(data);

    const tiledManager = TiledManager(schema);

    return tiledManager;
};
