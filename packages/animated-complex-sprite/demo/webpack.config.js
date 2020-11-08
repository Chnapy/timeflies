const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, 'public', 'index.html'),
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true
                        }
                    }
                ],
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src')
            },
        ],
    },
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    plugins: [HTMLWebpackPluginConfig],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public', 'dist'),
        chunkFilename: '[id].[chunkhash].js',
        sourceMapFilename: '[name].[hash:8].map',
        pathinfo: false
    },
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: false,
        port: 9000,
        open: true,
        stats: 'errors-only'
    },
    optimization: {
        runtimeChunk: true,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    }
};
