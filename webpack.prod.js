
const { DefinePlugin } = require('webpack'),
      merge            = require('webpack-merge'),
      common           = require('./webpack.common.js'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      UglifyJSPlugin    = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {

  module: {
    rules: [

      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }

    ]
  },

  plugins: [
    new ExtractTextPlugin('resources/styles/style.css'),
    new UglifyJSPlugin(),
    new DefinePlugin({
      __DEV__: false,
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

});
