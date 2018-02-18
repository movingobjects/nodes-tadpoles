
const { DefinePlugin } = require('webpack'),
      merge            = require('webpack-merge'),
      common           = require('./webpack.common.js'),
      UglifyJSPlugin    = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {

  plugins: [
    new UglifyJSPlugin(),
    new DefinePlugin({
      __DEV__: false,
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

});
