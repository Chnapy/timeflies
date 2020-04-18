
export const getEndpoint = (protocol: 'http' | 'ws', url: string) => {

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

