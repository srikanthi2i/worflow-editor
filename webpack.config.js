const path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'js/main.bundle.js'
  },
  module: {
    rules: [{
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader')
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    publicPath: '/dist/',
    port: 9000
  },
  plugins: [
    new ExtractTextPlugin('css/main.bundle.css')
  ],
  devtool: 'inline-source-map'
}
