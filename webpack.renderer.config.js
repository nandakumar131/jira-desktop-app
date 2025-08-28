const rules = require('./webpack.rules');
const HtmlWebpackPlugin = require('html-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  output: {
    publicPath: '/',
  },
  module: {
    rules,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['app'],
    }),
    new HtmlWebpackPlugin({
      template: './src/settings.html',
      filename: 'settings/index.html',
      chunks: ['settings'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  entry: {
    app: './src/renderer.js',
    settings: './src/settings.js',
  },
};