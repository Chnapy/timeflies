import urlJoin from 'url-join';
import { config } from '../main/config';
import { getEnv } from './env';

export type AssetUrl = typeof assetUrl;
export const assetUrl = {
    toBackend: (baseUrl: string) => urlJoin(config.staticFolderName, baseUrl),
    toFrontend: (baseUrl: string) => urlJoin(getEnv('HOST_URL'), config.staticFolderName, baseUrl)
};
