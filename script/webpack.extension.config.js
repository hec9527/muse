const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  mode: 'development',

  entry: path.resolve(__dirname, '../src/extension.ts'),

  // webpack5 不再自动导入nodejs profill，如果代码运行在node环境中， 需要添加这个配置
  target: 'node',

  devtool: false,

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },

  externals: {
    vscode: 'commonjs vscode',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        // 这里如果使用 babel-loader 会导致插件无法打开，不知道为啥
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

module.exports = config;
