// shared config (dev and prod)
//@ts-check

const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const postcssNormalize = require('postcss-normalize');
const resolve = require('resolve');
const ManifestPlugin = require('webpack-manifest-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const webpackDevClientEntry = require.resolve(
    'react-dev-utils/webpackHotDevClient'
);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envStringified = {
    'process.env': Object.keys(process.env).reduce((env, key) => {
        env[ key ] = JSON.stringify(process.env[ key ]);
        return env;
    }, {}),
};

const paths = {
    entry: require.resolve('./src/index.ts'),
    root: '.',
    src: path.join(__dirname, './src'),
    publicHtml: './public/index.html',
    nodeModules: './node_modules',
    tsconfig: './tsconfig.json',
    packageJson: './package.json'
}

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
    mode: 'development',
    entry: [
        webpackDevClientEntry,
        paths.entry
    ],
    devServer: {
        contentBase: './public/',
        open: true,
        hot: true,
        compress: true,
        port: 3000,
        overlay: true,
        clientLogLevel: 'none',

        // TODO ignore test/storybook files
        // watchOptions: {
        //     ignored: 
        // }
    },
    devtool: 'cheap-module-source-map',
    output: {
        pathinfo: true,
        publicPath: "/",
        filename: 'static/js/bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        globalObject: 'this',
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.jsx' ],

        plugins: [

            // Prevents users from importing files from outside of src/ (or node_modules/).
            // This often causes confusion because we only process files within src/ with babel.
            // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
            // please link the files into your node_modules/ and let module-resolution kick in.
            // Make sure your source files are compiled, as they will not be processed in any way.
            new ModuleScopePlugin(paths.src, [ paths.packageJson ]),
        ],
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
    module: {
        strictExportPresence: true,
        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },

            // Linter.
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: [
                    /\.test.tsx?$/,
                    /\.stories.tsx?$/,
                    /\.seed.tsx?$/,
                ],
                enforce: 'pre',
                use: [
                    {
                        options: {
                            cache: true,
                            formatter: require.resolve('react-dev-utils/eslintFormatter'),
                            eslintPath: require.resolve('eslint'),
                            resolvePluginsRelativeTo: __dirname,
                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: paths.src,
            },

            {
                exclude: [
                    /\.test.tsx?$/,
                    /\.stories.tsx?$/,
                    /\.seed.tsx?$/,
                ],
                oneOf: [
                    {
                        test: [ /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/ ],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },

                    {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        include: paths.src,
                        loader: require.resolve('babel-loader'),
                        options: {
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                        },
                    },

                    // For js files outside of src
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            compact: false,
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
                                getLocalIdent: getCSSModuleLocalIdent,
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
                                    getLocalIdent: getCSSModuleLocalIdent,
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
                ]
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.publicHtml,
        }),

        // @ts-ignore
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, process.env),

        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin(paths.root),

        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV is set to production
        // during a production build.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(envStringified),

        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),

        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebook/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),

        new WatchMissingNodeModulesPlugin(paths.nodeModules),

        // Generate an asset manifest file with the following content:
        // - "files" key: Mapping of all asset filenames to their corresponding
        //   output file so that tools can pick it up without having to parse
        //   `index.html`
        // - "entrypoints" key: Array of files which are included in `index.html`,
        //   can be used to reconstruct the HTML if necessary
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[ file.name ] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = entrypoints.main.filter(
                    fileName => !fileName.endsWith('.map')
                );

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),

        // Type checking
        new ForkTsCheckerWebpackPlugin({
            async: true,
            // eslint: true,
            useTypescriptIncrementalApi: true,
            checkSyntacticErrors: true,
            // @ts-ignore
            resolveModuleNameModule: process.versions.pnp
                ? `${__dirname}/pnpTs.js`
                : undefined,
            // @ts-ignore
            resolveTypeReferenceDirectiveModule: process.versions.pnp
                ? `${__dirname}/pnpTs.js`
                : undefined,
            tsconfig: paths.tsconfig,
            reportFiles: [
                '**',
                '!**/__tests__/**',
                '!**/?(*.)(spec|test).*',
                '!**/src/setupProxy.*',
                '!**/src/setupTests.*',
            ],
            silent: true
            // ignoreLintWarnings: true,

        }),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell webpack to provide empty mocks for them so importing them works.
    node: {
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    // externals: {
    //     'react': 'React',
    //     'react-dom': 'ReactDOM',
    // },
};

module.exports = config;
