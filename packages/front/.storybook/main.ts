import { Configuration } from 'webpack';

/**
 * Remove hash generation from file-loader,
 * and remove url-loader from config.
 * 
 * The goal is to remove random generation and data64 loading
 * for map loading (see AssetLoader).
 * 
 * @param {Configuration} webpackConfig 
 */
const webpackNoAssetsHashNorData64 = (webpackConfig: Configuration): Configuration => {

  const throwUnexpectedConfigError = (message: string): never => { throw new Error(message); };

  const oneOfRule = webpackConfig.module?.rules.find(r => !!r.oneOf);

  const fileLoader = oneOfRule?.oneOf!.find(r => typeof r.loader === 'string' && r.loader.includes('file-loader'));

  if (!fileLoader) {
    throwUnexpectedConfigError('file-loader not found');
  }

  (fileLoader!.options as Record<string, any>).name = 'static/media/[name].[ext]';

  oneOfRule!.oneOf = oneOfRule!.oneOf!.filter(r => typeof r.loader !== 'string' || !r.loader.includes('url-loader'));

  return webpackConfig;
};

module.exports = {
  stories: [ '../src/**/*.stories.tsx' ],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  webpackFinal: async (config: Configuration): Promise<Configuration> => {

    webpackNoAssetsHashNorData64(config);

    return config;
  },
};

export { };
