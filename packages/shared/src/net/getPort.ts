
export const getPort = () => Number(process.env.PORT || 2567);

export const getEndpoint = (protocol: 'http' | 'ws') =>
    `${protocol}://localhost:${getPort()}`;
