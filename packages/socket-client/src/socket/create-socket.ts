
const createEndpoint = (protocol: 'http' | 'ws', url: string) => {

    const isHttps = url.startsWith('https');

    const startIndex = url.indexOf('://');
    if (startIndex !== -1) {
        url = url.substr(startIndex + 3);
    }

    const prefix = isHttps
        ? protocol + 's'
        : protocol;

    return `${prefix}://${url}`;
};


const createAuthenticatedEndpoint = (token: string, serverUrl: string): string => {
    const baseEndpoint = createEndpoint('ws', serverUrl);

    const url = new URL(baseEndpoint);
    url.searchParams.set('token', token);

    return url.href;
};


export const createSocket = (serverUrl: string) => {
    return (token: string) => {

        const endpoint = createAuthenticatedEndpoint(token, serverUrl);

        const socket = new WebSocket(endpoint);

        return socket;
    };
};
