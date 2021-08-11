/* eslint-disable @typescript-eslint/naming-convention */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
  },
};

/** @type {import("webpack").Configuration} */
const config = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/app/index.tsx'),

  target: 'node',

  output: {
    path: path.resolve(__dirname, './dist/webview'),
    filename: 'main.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [babelLoader],
      },
      {
        test: /\.tsx?$/,
        use: [babelLoader, 'ts-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.less'],
  },

  plugins: [
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, './src/app/template/index.html'),
    // }),
  ],
};

module.exports = config;
