import { getEndpoint } from '@timeflies/shared';
import urlJoin from 'url-join';
import { envManager } from './envManager';

// TODO temp config file

const hostUrl = getEndpoint('http', envManager.HOST_URL);

// Static

export const staticPostURL = '/static';

export const staticURL = urlJoin(hostUrl, staticPostURL);
