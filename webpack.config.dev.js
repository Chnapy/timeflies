const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');

module.exports = {
    mode: "development",
    devtool: "eval-source-map",
    entry: "./src/index.tsx",
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: {
                                getLocalIdent: getCSSModuleLocalIdent,
                            }
                        }
                    }
                ],
                include: /\.module\.css$/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
                exclude: /\.module\.css$/
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml|json)$/i,
                type: 'javascript/auto',
                loader: "file-loader",
                options: { name: './[name].[hash].[ext]' }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            root: path.resolve(__dirname, "/dist")
        }),
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true),
            EXPERIMENTAL: JSON.stringify(true),
            PLUGIN_CAMERA3D: JSON.stringify(false),
            PLUGIN_FBINSTANT: JSON.stringify(false),
            FEATURE_SOUND: JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        port: 9000,
        compress: true,
        open: true,
        overlay: true,
    }
}
