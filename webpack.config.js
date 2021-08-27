/* eslint-disable @typescript-eslint/naming-convention */

const path = require('path');
const webpack = require('webpack');

// const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
  },
};

/** @type {import("webpack").Configuration['plugins']} */
const plugins = [
  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  }),
];

// if (process.env.NODE_ENV === 'development') {
//   plugins.push(
//     new HtmlWebpackPlugin({
//       template: path.resolve(__dirname, './src/app/template/index.html'),
//     })
//   );
// }

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
        test: /\.(j|t)sx?$/,
        use: [babelLoader],
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

  plugins,
};

module.exports = config;
