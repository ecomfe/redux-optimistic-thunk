/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    entry: {
        js: './index.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'app-[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            path.resolve(__dirname, '..', '..', 'node_modules'),
            __dirname
        ]
    },
    plugins: [new HtmlWebpackPlugin()],
    devServer: {
        contentBase: '.',
        historyApiFallback: true,
        port: 3000,
        compress: false,
        inline: false,
        hot: false,
        host: 'localhost',
        stats: {
            assets: true,
            children: false,
            chunks: false,
            hash: false,
            modules: false,
            publicPath: false,
            timings: true,
            version: false,
            warnings: true,
            colors: {
                green: '\u001b[32m'
            }
        }
    }
};
