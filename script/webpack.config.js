/* eslint-disable @typescript-eslint/naming-convention */

const path = require('path');
const webpack = require('webpack');

/** @type {import("webpack").Configuration} */
const config = {
  mode: 'development',
  entry: path.resolve(__dirname, '../src/app/index.tsx'),

  target: 'node',

  output: {
    path: path.resolve(__dirname, '../dist/view'),
    filename: 'index.js',
  },

  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: ['babel-loader'],
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
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

module.exports = config;
