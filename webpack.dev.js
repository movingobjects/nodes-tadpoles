
const { DefinePlugin } = require('webpack'),
      merge            = require('webpack-merge'),
      common           = require('./webpack.common.js');

module.exports = merge(common, {

  devtool: 'cheap-inline-source-map',

  module: {
    rules: [

      {
        test: /\.jsx?$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: /node_modules\/paper/,
      },

      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      }

    ]
  },

  plugins: [
    new DefinePlugin({
      __DEV__: true,
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ],

});
