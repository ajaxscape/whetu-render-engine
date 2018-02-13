const path = require('path')
const webpack = require('webpack')
const { getIfUtils, removeEmpty } = require('webpack-config-utils')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const nodeEnv = process.env.NODE_ENV || 'development'
const { ifDevelopment, ifProduction } = getIfUtils(nodeEnv)

module.exports = removeEmpty({
  entry: {
    js: './src/index.js',
    css: './src/index.scss'
  },

  output: {
    filename: ifProduction('[name]-bundle-[hash].js', '[name]-bundle.js'),
    path: path.resolve(__dirname, 'public')
  },

  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: { url: false }
          }, 'sass-loader']
        })
      },
      {
        test: /\.js/,
        use: ['babel-loader?cacheDirectory'],
        exclude: /node_modules/
      }
    ]
  },

  devtool: ifDevelopment('eval-source-map', 'source-map'),

  devServer: ifDevelopment({
    host: '0.0.0.0',
    port: 3000,
    stats: 'normal'
  }),

  plugins: removeEmpty([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),

    new HtmlWebpackPlugin({
      hash: true,
      filename: 'index.html',
      template: './src/views/index.html',
      title: 'The Expanse',
      expanseServer: `${process.env.EXPANSE_SERVICE || 'ws://localhost:40510'}`,
      environment: nodeEnv
    }),

    new CopyWebpackPlugin([{ from: 'src/assets', to: 'assets' }]),

    ifProduction(
      new ExtractTextPlugin('[name]-bundle-[hash].css'),
      new ExtractTextPlugin('[name]-bundle.css')
    )
  ]),

  node: {
    fs: 'empty'
  }
})