//@ts-check
const path = require("path");
const webpack = require("webpack");
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const postcssNormalize = require('postcss-normalize');
const loaderUtils = require('loader-utils');

function getLocalIdent(
    context,
    localIdentName,
    localName,
    options
) {
    // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
    const fileNameOrFolder = context.resourcePath.match(
        /index\.module\.(css|scss|sass)$/
    )
        ? '[folder]'
        : '[name]';
    // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
    const hash = loaderUtils.getHashDigest(
        // @ts-ignore
        path.posix.relative(context.rootContext, context.resourcePath) + localName,
        'md5',
        'base64',
        5
    );
    // Use loaderUtils to find the file or folder name
    const className = loaderUtils.interpolateName(
        context,
        fileNameOrFolder + '_' + localName + '__' + hash,
        options
    );
    // remove the .module that appears in every classname when based on the file.
    return className.replace('.module_', '_');
};

const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'web.jsx',
    'jsx',
];

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const paths = {
    packageJson: 'package.json',
    entry: './src/index.ts',
    src: './src',
    public: './public',
    moduleFileExtensions
};

const imageInlineSizeLimit = 10000;

const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
        require.resolve('style-loader'),
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve('postcss-loader'),
            options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009',
                        },
                        stage: 3,
                    }),
                    // Adds PostCSS Normalize as the reset css with default options,
                    // so that it honors browserslist config in package.json
                    // which in turn let's users customize the target behavior as per their needs.
                    postcssNormalize(),
                ],
            },
        },
    ];
    if (preProcessor) {
        loaders.push(
            {
                loader: require.resolve('resolve-url-loader'),
                options: {}
            },
            {
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: true,
                },
            }
        );
    }
    return loaders;
};

/** @type webpack.Configuration */

const config = {
    entry: paths.entry,
    mode: "development",
    devtool: 'cheap-module-source-map',
    resolve: {
        extensions: paths.moduleFileExtensions
            .map(ext => `.${ext}`)
    },
    output: {
        pathinfo: true,
        publicPath: "/dist/",
        filename: 'static/js/bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        globalObject: 'this',
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: false,
        },
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`,
        }
    },

    // devServer: {
    //     contentBase: path.join(__dirname, "public/"),
    //     port: 3000,
    //     publicPath: "http://localhost:3000/dist/",
    //     hotOnly: true
    // },
    plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
    ],
    resolveLoader: {
        plugins: [
            // Also related to Plug'n'Play, but this time it tells webpack to load its loaders
            // from the current package.
            PnpWebpackPlugin.moduleLoader(module),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            cache: true,
                            // formatter: require.resolve('react-dev-utils/eslintFormatter'),
                            eslintPath: require.resolve('eslint'),
                            resolvePluginsRelativeTo: __dirname,
                            ignore: true,
                            useEslintrc: true,
                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: paths.src,
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works like "file" loader except that it embeds assets
                    // smaller than specified limit in bytes as data URLs to avoid requests.
                    // A missing `test` is equivalent to a match.
                    {
                        test: [ /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/ ],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: imageInlineSizeLimit,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    // Process application JS with Babel.
                    // The preset includes JSX, Flow, TypeScript, and some ESnext features.
                    {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        include: paths.src,
                        loader: require.resolve('babel-loader'),
                        options: {
                            customize: require.resolve(
                                'babel-preset-react-app/webpack-overrides'
                            ),
                            babelrc: false,
                            configFile: false,
                            presets: [ require.resolve('babel-preset-react-app') ],
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                        },
                    },
                    // Process any JS outside of the app with Babel.
                    // Unlike the application JS, we only compile the standard ES features.
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    require.resolve('babel-preset-react-app/dependencies'),
                                    { helpers: true },
                                ],
                            ],
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            // Babel sourcemaps are needed for debugging into node_modules
                            // code.  Without the options below, debuggers like VSCode
                            // show incorrect code and set breakpoints on the wrong lines.
                            sourceMaps: true,
                            inputSourceMap: true,
                        },
                    },
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader turns CSS into JS modules that inject <style> tags.
                    // In production, we use MiniCSSExtractPlugin to extract that CSS
                    // to a file, but in development "style" loader enables hot editing
                    // of CSS.
                    // By default we support CSS Modules with the extension .module.css
                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                        }),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true,
                    },
                    // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
                    // using the extension .module.css
                    {
                        test: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            modules: {
                                getLocalIdent,
                            },
                        }),
                    },
                    // Opt-in support for SASS (using .scss or .sass extensions).
                    // By default we support SASS Modules with the
                    // extensions .module.scss or .module.sass
                    {
                        test: sassRegex,
                        exclude: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                            },
                            'sass-loader'
                        ),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true,
                    },
                    // Adds support for CSS Modules, but using SASS
                    // using the extension .module.scss or .module.sass
                    {
                        test: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                                modules: {
                                    getLocalIdent,
                                },
                            },
                            'sass-loader'
                        ),
                    },
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` so it get processed
                        // by webpacks internal loaders.
                        exclude: [ /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/ ],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                        type: 'javascript/auto',
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
        ],
    },
    // plugins: [ new webpack.HotModuleReplacementPlugin() ]
};

module.exports = config;
