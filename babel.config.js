
module.exports = (api) => {
    api.cache(true);

    return {
        presets: [
            [ '@babel/preset-env', {
                targets: { node: 'current' }
            } ],
            [ '@babel/preset-typescript', {
                allowNamespaces: true
            } ],
            '@babel/preset-react'
        ],
        ignore: [ 'node_modules' ],
    };
};
